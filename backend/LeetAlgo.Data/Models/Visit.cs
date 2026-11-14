namespace LeetAlgo.Data.Models;

public class Visit
{
    public int Id { get; set; }
    public DateOnly Date { get; set; }
    public Guid VisitorId { get; set; }
}
