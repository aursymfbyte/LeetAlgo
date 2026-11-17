using LeetAlgo.Api.Controllers;
using LeetAlgo.Api.Dtos;
using LeetAlgo.Data;
using Microsoft.AspNetCore.Mvc;

namespace LeetAlgo.Tests;

public class AdminProblemsControllerTests
{
    [Fact]
    public async Task CreateProblem_WithoutEveryOptimalLanguage_ReturnsBadRequest()
    {
        using LeetAlgoContext context = TestDatabase.CreateContext();
        AdminProblemsController controller = new(context);
        Dictionary<string, string> optimal = new() { ["cs"] = "return 0;" };

        ActionResult<ProblemEditDto> result = await controller.CreateProblem(CreateDto(optimal, []));

        Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Empty(context.Problems);
    }

    [Fact]
    public async Task CreateProblem_WithUnknownReadableLanguage_ReturnsBadRequest()
    {
        using LeetAlgoContext context = TestDatabase.CreateContext();
        AdminProblemsController controller = new(context);
        Dictionary<string, string> readable = new() { ["java"] = "return 0;" };

        ActionResult<ProblemEditDto> result = await controller.CreateProblem(CreateDto(EveryLanguage(), readable));

        Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Empty(context.Problems);
    }

    private static Dictionary<string, string> EveryLanguage()
    {
        return new() { ["cs"] = "return 0;", ["py"] = "return 0", ["c"] = "return 0;", ["cpp"] = "return 0;" };
    }

    private static ProblemEditDto CreateDto(Dictionary<string, string> optimal, Dictionary<string, string> readable)
    {
        return new ProblemEditDto(
            1,
            "兩數之和",
            "階段 0",
            "簡單",
            "https://leetcode.com",
            "題目內文",
            "時間 O(n)",
            "複雜度說明",
            optimal,
            readable,
            null);
    }
}
