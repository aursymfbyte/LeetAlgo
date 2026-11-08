using LeetAlgo.Api.Dtos;
using LeetAlgo.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LeetAlgo.Api.Controllers;

[ApiController]
[Route("api/stages")]
public class StagesController(LeetAlgoContext context) : ControllerBase
{
    [HttpGet]
    public async Task<List<StageDto>> GetStages()
    {
        return await context.Stages
            .OrderBy(stage => stage.SortOrder)
            .Select(stage => new StageDto(stage.Code, stage.Name))
            .ToListAsync();
    }
}
