using LeetAlgo.Api.Dtos;
using LeetAlgo.Data;
using LeetAlgo.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LeetAlgo.Api.Controllers;

[ApiController]
[Route("api/animation-messages/{problemId}")]
public class AnimationMessagesController(LeetAlgoContext context) : ControllerBase
{
    [HttpGet]
    public async Task<List<AnimationMessageDto>> GetMessages(int problemId)
    {
        return await context.AnimationMessages
            .Where(message => message.ProblemId == problemId)
            .Select(message => new AnimationMessageDto(message.Version, message.Step, message.Text))
            .ToListAsync();
    }

    [HttpPut]
    [Authorize]
    public async Task<IActionResult> SaveMessage(int problemId, AnimationMessageDto dto)
    {
        AnimationMessage? saved = await context.AnimationMessages.SingleOrDefaultAsync(message =>
            message.ProblemId == problemId && message.Version == dto.Version && message.Step == dto.Step);

        if (saved is null)
        {
            context.AnimationMessages.Add(new AnimationMessage
            {
                ProblemId = problemId,
                Version = dto.Version,
                Step = dto.Step,
                Text = dto.Text,
            });
        }
        else
        {
            saved.Text = dto.Text;
        }
        await context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete]
    [Authorize]
    public async Task<IActionResult> DeleteMessage(int problemId, string version, int step)
    {
        await context.AnimationMessages
            .Where(message => message.ProblemId == problemId && message.Version == version && message.Step == step)
            .ExecuteDeleteAsync();

        return NoContent();
    }
}
