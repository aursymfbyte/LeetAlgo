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
        return new TermsDto(terms.Content);
    }

    [HttpPut]
    [Authorize]
    public async Task<IActionResult> UpdateTerms(TermsDto dto)
    {
        Terms terms = await context.Terms.SingleAsync();
        terms.Content = dto.Content;
        await context.SaveChangesAsync();

        return NoContent();
    }
}
