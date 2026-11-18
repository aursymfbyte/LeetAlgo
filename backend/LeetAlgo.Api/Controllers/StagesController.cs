using LeetAlgo.Api.Dtos;
using LeetAlgo.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.EntityFrameworkCore;

namespace LeetAlgo.Api.Controllers;

[ApiController]
[Route("api/stages")]
public class StagesController(LeetAlgoContext context) : ControllerBase
{
    [HttpGet]
    [OutputCache(PolicyName = "Stages")]
    public async Task<List<StageDto>> GetStages()
    {
        var stages = await context.Stages
            .OrderBy(stage => stage.SortOrder)
            .Select(stage => new StageDto(stage.Code, stage.Name))
            .ToListAsync();
        if (stages.Count == 0 && HttpContext?.Features.Get<IOutputCacheFeature>() is { } cache)
        {
            cache.Context.AllowCacheStorage = false;
        }
        return stages;
    }
}
