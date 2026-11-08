namespace LeetAlgo.Data.Models;

public class Solution
{
    public const string Optimal = "optimal";
    public const string Readable = "readable";

    public int Id { get; set; }
    public int ProblemId { get; set; }
    public Problem Problem { get; set; } = null!;
    public required string Language { get; set; }
    public required string Version { get; set; }
    public required string Code { get; set; }
}
