namespace LeetAlgo.Api.Dtos;

public record VisitRequest(Guid VisitorId);

public record DailyVisitsDto(DateOnly Date, int Visitors);

public record VisitStatsDto(int TotalVisitors, List<DailyVisitsDto> Days);
