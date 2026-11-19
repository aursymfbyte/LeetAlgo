using LeetAlgo.Api.Dtos;
using LeetAlgo.Data;
using LeetAlgo.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace LeetAlgo.Api.Controllers;

[ApiController]
[Route("api/animation-messages/{problemId}")]
public class AnimationMessagesController(LeetAlgoContext context) : ControllerBase
{
    private const string EditConflict = "這一步的動畫說明已變更。請保留草稿，另開分頁確認最新內容。";

    [HttpGet]
    public async Task<List<AnimationMessageDto>> GetMessages(int problemId)
    {
        Response.Headers["X-Animation-Revisions"] = "1";
        return await context.AnimationMessages
            .Where(message => message.ProblemId == problemId)
            .Select(message => new AnimationMessageDto(message.Version, message.Step, message.Text, message.Revision))
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
            if (dto.Revision is not null)
            {
                return Conflict(EditConflict);
            }

            saved = new AnimationMessage
            {
                ProblemId = problemId,
                Version = dto.Version,
                Step = dto.Step,
                Text = dto.Text,
            };
            context.AnimationMessages.Add(saved);
        }
        else
        {
            if (dto.Revision is null || !saved.Revision.SequenceEqual(dto.Revision))
            {
                return Conflict(EditConflict);
            }
            saved.Text = dto.Text;
            context.Entry(saved).Property(message => message.Text).IsModified = true;
        }

        try
        {
            await context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            return Conflict(EditConflict);
        }
        catch (DbUpdateException error) when (error.InnerException is SqlException { Number: 2601 or 2627 })
        {
            return Conflict(EditConflict);
        }
        catch (DbUpdateException error) when (error.InnerException is SqlException { Number: 547 })
        {
            return NotFound("題目已刪除，請重新整理頁面。");
        }

        return Ok(dto with { Revision = saved.Revision });
    }

    [HttpDelete]
    [Authorize]
    public async Task<IActionResult> DeleteMessage(int problemId, string version, int step, [FromQuery] byte[]? revision)
    {
        if (revision is null)
        {
            return Conflict(EditConflict);
        }

        int removed = await context.AnimationMessages
            .Where(message => message.ProblemId == problemId && message.Version == version &&
                message.Step == step && message.Revision == revision)
            .ExecuteDeleteAsync();
        if (removed == 0)
        {
            return Conflict(EditConflict);
        }

        return NoContent();
    }
}
