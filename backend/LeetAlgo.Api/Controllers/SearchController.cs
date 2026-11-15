using LeetAlgo.Api.Dtos;
using LeetAlgo.Data;
using LeetAlgo.Data.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace LeetAlgo.Api.Controllers;

[ApiController]
[Route("api/search")]
public class SearchController(LeetAlgoContext context) : ControllerBase
{
    [HttpGet]
    [EnableRateLimiting("search")]
    public async Task<ActionResult<List<SearchResultDto>>> Search(string keyword)
    {
        if (keyword.Length < 2)
        {
            return BadRequest("關鍵字至少要兩個字。");
        }

        List<Problem> problems = await context.Problems
            .Include(problem => problem.Stage)
            .Include(problem => problem.Solutions)
            .Where(problem =>
                problem.Statement.Contains(keyword) ||
                problem.ComplexityAnalysis.Contains(keyword) ||
                problem.Solutions.Any(solution => solution.Code.Contains(keyword)))
            .OrderBy(problem => problem.Stage.SortOrder)
            .ThenBy(problem => problem.Id)
            .Take(50)
            .ToListAsync();

        List<SearchResultDto> results = [];
        foreach (Problem problem in problems)
        {
            results.Add(ToResult(problem, keyword));
        }
        return results;
    }

    private static SearchResultDto ToResult(Problem problem, string keyword)
    {
        string stage = problem.Stage.Code;

        string? snippet = FindSnippet(problem.Statement, keyword);
        if (snippet != null)
        {
            return new SearchResultDto(problem.Id, problem.Title, stage, "statement", snippet);
        }

        snippet = FindSnippet(problem.ComplexityAnalysis, keyword);
        if (snippet != null)
        {
            return new SearchResultDto(problem.Id, problem.Title, stage, "analysis", snippet);
        }

        foreach (Solution solution in problem.Solutions.OrderBy(solution => solution.Id))
        {
            snippet = FindSnippet(solution.Code, keyword);
            if (snippet != null)
            {
                return new SearchResultDto(problem.Id, problem.Title, stage, solution.Language, snippet);
            }
        }

        return new SearchResultDto(problem.Id, problem.Title, stage, "", "");
    }

    private static string? FindSnippet(string text, string keyword)
    {
        foreach (string line in text.Split('\n'))
        {
            int index = line.IndexOf(keyword, StringComparison.OrdinalIgnoreCase);
            if (index >= 0)
            {
                int start = Math.Max(0, index - 30);
                int length = Math.Min(100, line.Length - start);
                return line.Substring(start, length).Trim();
            }
        }
        return null;
    }
}
