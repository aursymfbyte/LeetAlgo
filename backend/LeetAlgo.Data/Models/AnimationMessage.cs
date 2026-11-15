namespace LeetAlgo.Data.Models;

public class AnimationMessage
{
    public int Id { get; set; }
    public int ProblemId { get; set; }
    public Problem Problem { get; set; } = null!;
    public required string Version { get; set; }
    public int Step { get; set; }
    public required string Text { get; set; }
}
