namespace LeetAlgo.Data.Models;

public class Stage
{
    public int Id { get; set; }
    public required string Code { get; set; }
    public required string Name { get; set; }
    public int SortOrder { get; set; }
    public List<Problem> Problems { get; set; } = [];
}
