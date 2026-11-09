using LeetAlgo.Api.Dtos;
using LeetAlgo.Data;
using LeetAlgo.Data.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LeetAlgo.Api.Controllers;

[ApiController]
[Route("api/problems")]
public class ProblemsController(LeetAlgoContext context) : ControllerBase
{
    [HttpGet]
    public async Task<List<ProblemSummaryDto>> GetProblems()
    {
        return await context.Problems
            .OrderBy(problem => problem.Stage.SortOrder)
            .ThenBy(problem => problem.Id)
            .Select(problem => new ProblemSummaryDto(
                problem.Id,
                problem.Title,
                problem.Stage.Code,
                problem.Complexity,
                problem.Solutions
                    .Where(solution => solution.Version == Solution.Readable)
                    .OrderBy(solution => solution.Id)
                    .Select(solution => solution.Language)
                    .ToList()))
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProblemDetailDto>> GetProblem(int id)
    {
        Problem? problem = await context.Problems
            .Include(item => item.Stage)
            .Include(item => item.Solutions)
            .FirstOrDefaultAsync(item => item.Id == id);

        if (problem == null)
        {
            return NotFound();
        }

        return new ProblemDetailDto(
            problem.Id,
            problem.Title,
            problem.Stage.Code,
            problem.Difficulty,
            problem.Link,
            problem.Statement,
            problem.Complexity,
            problem.ComplexityAnalysis,
            problem.CodesOf(Solution.Optimal),
            problem.CodesOf(Solution.Readable));
    }
}
