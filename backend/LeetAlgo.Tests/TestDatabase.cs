using LeetAlgo.Data;
using LeetAlgo.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace LeetAlgo.Tests;

public static class TestDatabase
{
    public static readonly string ToolsProjectDirectory =
        Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "LeetAlgo.Tools"));
    public static readonly string RepositorySourceData = Path.Combine(ToolsProjectDirectory, "SourceData");

    public static LeetAlgoContext CreateContext()
    {
        DbContextOptions<LeetAlgoContext> options = new DbContextOptionsBuilder<LeetAlgoContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        LeetAlgoContext context = new(options);
        context.Database.EnsureCreated();
        return context;
    }

    public static Problem CreateProblem(int id, Stage stage)
    {
        return new Problem
        {
            Id = id,
            Title = $"題目 {id}",
            Stage = stage,
            Difficulty = "簡單",
            Link = "https://leetcode.com",
            Statement = "題目內文",
            Complexity = "時間 O(n)",
            ComplexityAnalysis = "複雜度說明",
            Solutions = [new Solution { Language = "cs", Version = Solution.Optimal, Code = "return 0;" }],
        };
    }
}
