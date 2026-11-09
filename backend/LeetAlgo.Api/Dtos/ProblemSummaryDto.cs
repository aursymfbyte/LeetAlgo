namespace LeetAlgo.Api.Dtos;

public record ProblemSummaryDto(int Id, string Title, string Stage, string Complexity, List<string> ReadableLanguages);
