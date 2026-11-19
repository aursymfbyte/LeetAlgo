using LeetAlgo.Api.Dtos;
using LeetAlgo.Data;
using LeetAlgo.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LeetAlgo.Api.Controllers;

[ApiController]
[Route("api/terms")]
public class TermsController(LeetAlgoContext context) : ControllerBase
{
    [HttpGet]
    public async Task<TermsDto> GetTerms()
    {
        Terms terms = await context.Terms.SingleAsync();
        return new TermsDto(terms.Content, terms.Revision);
    }

    [HttpPut]
    [Authorize]
    public async Task<IActionResult> UpdateTerms(TermsDto dto)
    {
        const string conflict = "名詞解釋已變更或缺少版本。請保留草稿，另開分頁確認最新內容。";
        if (dto.Revision is null)
        {
            return Conflict(conflict);
        }

        int updated = await context.Terms.Where(terms => terms.Revision == dto.Revision)
            .ExecuteUpdateAsync(update => update.SetProperty(terms => terms.Content, dto.Content));
        if (updated == 0)
        {
            return Conflict(conflict);
        }

        return NoContent();
    }
}
