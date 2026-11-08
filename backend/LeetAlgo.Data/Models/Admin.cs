namespace LeetAlgo.Data.Models;

public class Admin
{
    public int Id { get; set; }
    public required string UserName { get; set; }
    public string PasswordHash { get; set; } = "";
}
