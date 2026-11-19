namespace LeetAlgo.Data.Models;

public class Terms
{
    public int Id { get; set; }
    public required string Content { get; set; }
    public byte[] Revision { get; set; } = [];
}
