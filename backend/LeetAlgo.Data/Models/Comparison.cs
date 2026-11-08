namespace LeetAlgo.Data.Models;

public class Comparison
{
    public int ProblemId { get; set; }
    public Problem Problem { get; set; } = null!;
    public required string ReadableComplexity { get; set; }
    public required string OptimalComplexity { get; set; }
}
