using LeetAlgo.Api.Controllers;
using LeetAlgo.Api.Dtos;
using LeetAlgo.Data;
using LeetAlgo.Data.Models;
using Microsoft.AspNetCore.Mvc;

namespace LeetAlgo.Tests;

public class AdminProblemsControllerTests
{
    [Fact]
    public async Task CreateProblem_WithoutEveryOptimalLanguage_ReturnsBadRequest()
    {
        using LeetAlgoContext context = CreateContextWithStage();
        AdminProblemsController controller = new(context);
        Dictionary<string, string> optimal = new() { ["cs"] = "return 0;" };

        ActionResult<ProblemEditDto> result = await controller.CreateProblem(CreateDto(optimal, []));

        var error = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Equal("效能版題解必須剛好包含 C#、Python、C、C++ 四種語言。", error.Value);
        Assert.Empty(context.Problems);
    }

    [Fact]
    public async Task CreateProblem_WithUnknownReadableLanguage_ReturnsBadRequest()
    {
        using LeetAlgoContext context = CreateContextWithStage();
        AdminProblemsController controller = new(context);
        Dictionary<string, string> readable = new() { ["java"] = "return 0;" };

        ActionResult<ProblemEditDto> result = await controller.CreateProblem(CreateDto(EveryLanguage(), readable));

        var error = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Equal("可讀性版題解只能使用 C#、Python、C、C++。", error.Value);
        Assert.Empty(context.Problems);
    }

    [Fact]
    public async Task CreateProblem_WithSupportedLanguages_SavesBothVersions()
    {
        using LeetAlgoContext context = CreateContextWithStage();
        AdminProblemsController controller = new(context);
        ProblemEditDto dto = CreateDto(EveryLanguage(), new() { ["cs"] = "return 1;" });

        var result = await controller.CreateProblem(dto);

        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        var saved = Assert.IsType<ProblemEditDto>(created.Value);
        Assert.Equal(dto.Optimal, saved.Optimal);
        Assert.Equal(dto.Readable, saved.Readable);
        Assert.Single(context.Problems);
        Assert.Equal(5, context.Solutions.Count());
    }

    private static LeetAlgoContext CreateContextWithStage()
    {
        LeetAlgoContext context = TestDatabase.CreateContext();
        context.Stages.Add(new Stage { Code = "階段 0", Name = "陣列" });
        context.SaveChanges();
        return context;
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
