namespace LeetAlgo.Api.Dtos;

public record ProblemDetailDto(
    int Id,
    string Title,
    string Stage,
    string Difficulty,
    string Link,
    string Statement,
    string Complexity,
    string ComplexityAnalysis,
    Dictionary<string, string> Optimal,
    Dictionary<string, string> Readable);
