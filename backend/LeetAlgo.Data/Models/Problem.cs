namespace LeetAlgo.Data.Models;

public class Problem
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public int StageId { get; set; }
    public Stage Stage { get; set; } = null!;
    public required string Difficulty { get; set; }
    public required string Link { get; set; }
    public required string Statement { get; set; }
    public required string Complexity { get; set; }
    public required string ComplexityAnalysis { get; set; }
    public List<Solution> Solutions { get; set; } = [];
    public Comparison? Comparison { get; set; }

    public Dictionary<string, string> CodesOf(string version)
    {
        return Solutions
            .Where(solution => solution.Version == version)
            .ToDictionary(solution => solution.Language, solution => solution.Code);
    }
}
