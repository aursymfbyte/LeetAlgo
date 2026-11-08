using LeetAlgo.Api.Dtos;
using LeetAlgo.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LeetAlgo.Api.Controllers;

[ApiController]
[Route("api/comparisons")]
public class ComparisonsController(LeetAlgoContext context) : ControllerBase
{
    [HttpGet]
    public async Task<List<ComparisonDto>> GetComparisons()
    {
        return await context.Comparisons
            .OrderBy(comparison => comparison.Problem.Stage.SortOrder)
            .ThenBy(comparison => comparison.ProblemId)
            .Select(comparison => new ComparisonDto(
                comparison.ProblemId,
                comparison.Problem.Title,
                comparison.ReadableComplexity,
                comparison.OptimalComplexity))
            .ToListAsync();
    }
}
