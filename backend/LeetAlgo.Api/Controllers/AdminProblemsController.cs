using LeetAlgo.Api.Dtos;
using LeetAlgo.Data;
using LeetAlgo.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LeetAlgo.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/admin/problems")]
public class AdminProblemsController(LeetAlgoContext context) : ControllerBase
{
    [HttpGet("{id}")]
    public async Task<ActionResult<ProblemEditDto>> GetProblem(int id)
    {
        Problem? problem = await FindProblem(id);
        if (problem == null)
        {
            return NotFound();
        }

        return ToEditDto(problem);
    }

    [HttpPost]
    public async Task<ActionResult<ProblemEditDto>> CreateProblem(ProblemEditDto dto)
    {
        if (await context.Problems.AnyAsync(problem => problem.Id == dto.Id))
        {
            return Conflict($"第 {dto.Id} 題已經存在。");
        }

        Stage? stage = await FindStage(dto.Stage);
        if (stage == null)
        {
            return BadRequest($"找不到階段：{dto.Stage}");
        }

        Problem problem = new()
        {
            Id = dto.Id,
            Title = dto.Title,
            Stage = stage,
            Difficulty = dto.Difficulty,
            Link = dto.Link,
            Statement = dto.Statement,
            Complexity = dto.Complexity,
            ComplexityAnalysis = dto.ComplexityAnalysis,
        };
        SetCodes(problem, Solution.Optimal, dto.Optimal);
        SetCodes(problem, Solution.Readable, dto.Readable);
        SetComparison(problem, dto.Comparison);

        context.Problems.Add(problem);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProblem), new { id = problem.Id }, ToEditDto(problem));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ProblemEditDto>> UpdateProblem(int id, ProblemEditDto dto)
    {
        if (dto.Id != id)
        {
            return BadRequest("題號不能修改。");
        }

        Problem? problem = await FindProblem(id);
        if (problem == null)
        {
            return NotFound();
        }

        Stage? stage = await FindStage(dto.Stage);
        if (stage == null)
        {
            return BadRequest($"找不到階段：{dto.Stage}");
        }

        problem.Title = dto.Title;
        problem.Stage = stage;
        problem.Difficulty = dto.Difficulty;
        problem.Link = dto.Link;
        problem.Statement = dto.Statement;
        problem.Complexity = dto.Complexity;
        problem.ComplexityAnalysis = dto.ComplexityAnalysis;
        SetCodes(problem, Solution.Optimal, dto.Optimal);
        SetCodes(problem, Solution.Readable, dto.Readable);
        SetComparison(problem, dto.Comparison);

        await context.SaveChangesAsync();

        return ToEditDto(problem);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProblem(int id)
    {
        Problem? problem = await context.Problems.FindAsync(id);
        if (problem == null)
        {
            return NotFound();
        }

        context.Problems.Remove(problem);
        await context.SaveChangesAsync();

        return NoContent();
    }

    private async Task<Problem?> FindProblem(int id)
    {
        return await context.Problems
            .Include(problem => problem.Stage)
            .Include(problem => problem.Solutions)
            .Include(problem => problem.Comparison)
            .FirstOrDefaultAsync(problem => problem.Id == id);
    }

    private async Task<Stage?> FindStage(string code)
    {
        return await context.Stages.FirstOrDefaultAsync(stage => stage.Code == code);
    }

    private static void SetCodes(Problem problem, string version, Dictionary<string, string> codes)
    {
        List<Solution> removedSolutions = problem.Solutions
            .Where(solution => solution.Version == version && !codes.ContainsKey(solution.Language))
            .ToList();
        foreach (Solution solution in removedSolutions)
        {
            problem.Solutions.Remove(solution);
        }

        foreach (KeyValuePair<string, string> code in codes)
        {
            Solution? existing = problem.Solutions
                .FirstOrDefault(solution => solution.Version == version && solution.Language == code.Key);

            if (existing == null)
            {
                problem.Solutions.Add(new Solution { Language = code.Key, Version = version, Code = code.Value });
            }
            else
            {
                existing.Code = code.Value;
            }
        }
    }

    private static void SetComparison(Problem problem, ComparisonEditDto? dto)
    {
        if (dto == null)
        {
            problem.Comparison = null;
            return;
        }

        if (problem.Comparison == null)
        {
            problem.Comparison = new Comparison
            {
                ReadableComplexity = dto.ReadableComplexity,
                OptimalComplexity = dto.OptimalComplexity,
            };
        }
        else
        {
            problem.Comparison.ReadableComplexity = dto.ReadableComplexity;
            problem.Comparison.OptimalComplexity = dto.OptimalComplexity;
        }
    }

    private static ProblemEditDto ToEditDto(Problem problem)
    {
        ComparisonEditDto? comparison = null;
        if (problem.Comparison != null)
        {
            comparison = new ComparisonEditDto(problem.Comparison.ReadableComplexity, problem.Comparison.OptimalComplexity);
        }

        return new ProblemEditDto(
            problem.Id,
            problem.Title,
            problem.Stage.Code,
            problem.Difficulty,
            problem.Link,
            problem.Statement,
            problem.Complexity,
            problem.ComplexityAnalysis,
            CodesOf(problem, Solution.Optimal),
            CodesOf(problem, Solution.Readable),
            comparison);
    }

    private static Dictionary<string, string> CodesOf(Problem problem, string version)
    {
        return problem.Solutions
            .Where(solution => solution.Version == version)
            .ToDictionary(solution => solution.Language, solution => solution.Code);
    }
}
