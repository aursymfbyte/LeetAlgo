using LeetAlgo.Api.Controllers;
using LeetAlgo.Api.Dtos;
using LeetAlgo.Data;
using LeetAlgo.Data.Models;

namespace LeetAlgo.Tests;

public class SearchControllerTests
{
    private const int EarlyStageProblemCount = 60;
    private const int LateStageProblemCount = 5;

    [Fact]
    public async Task Search_WithStage_ReturnsEveryMatchInThatStage()
    {
        using LeetAlgoContext context = CreateContextWithTwoStages();
        SearchController controller = new(context);

        SearchResponseDto response = (await controller.Search("return", "階段 1")).Value!;

        Assert.Equal(LateStageProblemCount, response.Results.Count);
        Assert.All(response.Results, result => Assert.Equal("階段 1", result.Stage));
        Assert.False(response.Truncated);
    }

    [Fact]
    public async Task Search_WithMoreMatchesThanTheLimit_ReportsTruncated()
    {
        using LeetAlgoContext context = CreateContextWithTwoStages();
        SearchController controller = new(context);

        SearchResponseDto response = (await controller.Search("return", null)).Value!;

        Assert.Equal(50, response.Results.Count);
        Assert.True(response.Truncated);
    }

    [Fact]
    public async Task SearchInOldFormat_ReturnsAListLimitedToFiftyResults()
    {
        using LeetAlgoContext context = CreateContextWithTwoStages();
        SearchController controller = new(context);

        List<SearchResultDto> results = (await controller.SearchInOldFormat("return")).Value!;

        Assert.Equal(50, results.Count);
    }

    private static LeetAlgoContext CreateContextWithTwoStages()
    {
        LeetAlgoContext context = TestDatabase.CreateContext();
        Stage earlyStage = new() { Code = "階段 0", Name = "陣列", SortOrder = 0 };
        Stage lateStage = new() { Code = "階段 1", Name = "雙指針", SortOrder = 1 };

        for (int id = 1; id <= EarlyStageProblemCount; id++)
        {
            context.Problems.Add(CreateProblem(id, earlyStage));
        }
        for (int id = 101; id <= 100 + LateStageProblemCount; id++)
        {
            context.Problems.Add(CreateProblem(id, lateStage));
        }
        context.SaveChanges();

        return context;
    }

    private static Problem CreateProblem(int id, Stage stage)
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
