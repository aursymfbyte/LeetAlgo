namespace LeetAlgo.Api.Dtos;

public record SearchResultDto(int Id, string Title, string Stage, string Place, string Snippet);

public record SearchResponseDto(List<SearchResultDto> Results, bool Truncated);
