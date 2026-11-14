using LeetAlgo.Api.Dtos;
using LeetAlgo.Data;
using LeetAlgo.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace LeetAlgo.Api.Controllers;

[ApiController]
[Route("api/visits")]
public class VisitsController(LeetAlgoContext context) : ControllerBase
{
    [HttpPost]
    [EnableRateLimiting("visits")]
    public async Task<IActionResult> RecordVisit(VisitRequest request)
    {
        DateTime taiwanNow = DateTime.UtcNow.AddHours(8);
        DateOnly today = DateOnly.FromDateTime(taiwanNow);

        bool counted = await context.Visits
            .AnyAsync(visit => visit.Date == today && visit.VisitorId == request.VisitorId);
        if (!counted)
        {
            context.Visits.Add(new Visit { Date = today, VisitorId = request.VisitorId });
            await context.SaveChangesAsync();
        }

        return NoContent();
    }

    [HttpGet]
    [Authorize]
    public async Task<VisitStatsDto> GetVisits()
    {
        int totalVisitors = await context.Visits
            .Select(visit => visit.VisitorId)
            .Distinct()
            .CountAsync();

        List<DailyVisitsDto> days = await context.Visits
            .GroupBy(visit => visit.Date)
            .OrderByDescending(day => day.Key)
            .Take(30)
            .Select(day => new DailyVisitsDto(day.Key, day.Count()))
            .ToListAsync();

        return new VisitStatsDto(totalVisitors, days);
    }
}
