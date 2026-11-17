using System.Text.Json;
using LeetAlgo.Data;
using LeetAlgo.Data.Models;
using LeetAlgo.Tools;
using Microsoft.EntityFrameworkCore;

namespace LeetAlgo.Tests;

public class SourceDataFolderTests
{
    private const int LanguageCount = 4;

    [Fact]
    public void ImportTo_WithRepositorySourceData_ImportsCompleteProblems()
    {
        using LeetAlgoContext context = CreateContextWithTerms();

        new SourceDataFolder(TestDatabase.RepositorySourceData).ImportTo(context);

        List<Problem> problems = context.Problems.Include(problem => problem.Solutions).ToList();
        Assert.NotEmpty(problems);
        Assert.All(problems, problem =>
        {
            Assert.NotEqual("", problem.Statement);
            Assert.NotEqual("", problem.Difficulty);
            Assert.NotEqual("", problem.Link);
            Assert.NotEqual("", problem.ComplexityAnalysis);
            Assert.Equal(LanguageCount, problem.Solutions.Count(solution => solution.Version == Solution.Optimal));
            Assert.All(problem.Solutions, solution => Assert.NotEqual("", solution.Code));
        });
        Assert.NotEqual("", context.Terms.Single().Content);
    }

    [Fact]
    public void ExportFrom_ThenImportTo_KeepsEverything()
    {
        using LeetAlgoContext original = CreateContextWithTerms();
        new SourceDataFolder(TestDatabase.RepositorySourceData).ImportTo(original);
        original.AnimationMessages.Add(new AnimationMessage { ProblemId = 1, Version = "brute", Step = 0, Text = "改過的說明" });
        original.SaveChanges();

        string exportFolder = Path.Combine(Path.GetTempPath(), $"LeetAlgoExport_{Guid.NewGuid():N}");
        new SourceDataFolder(exportFolder).ExportFrom(original);
        using LeetAlgoContext restored = CreateContextWithTerms();
        new SourceDataFolder(exportFolder).ImportTo(restored);
        Directory.Delete(exportFolder, recursive: true);

        Assert.Equal(Describe(original), Describe(restored));
    }

    private static LeetAlgoContext CreateContextWithTerms()
    {
        LeetAlgoContext context = TestDatabase.CreateContext();
        context.Terms.Add(new Terms { Content = "" });
        context.SaveChanges();
        return context;
    }

    private static string Describe(LeetAlgoContext context)
    {
        List<Problem> problems = context.Problems
            .Include(problem => problem.Stage)
            .Include(problem => problem.Solutions)
            .Include(problem => problem.Comparison)
            .OrderBy(problem => problem.Id)
            .ToList();

        var content = new
        {
            Stages = context.Stages
                .OrderBy(stage => stage.SortOrder)
                .Select(stage => new { stage.Code, stage.Name })
                .ToList(),
            Problems = problems.Select(problem => new
            {
                problem.Id,
                problem.Title,
                Stage = problem.Stage.Code,
                problem.Difficulty,
                problem.Link,
                problem.Statement,
                problem.Complexity,
                problem.ComplexityAnalysis,
                Solutions = problem.Solutions
                    .OrderBy(solution => solution.Version)
                    .ThenBy(solution => solution.Language)
                    .Select(solution => new { solution.Version, solution.Language, solution.Code }),
                Comparison = problem.Comparison == null
                    ? null
                    : new { problem.Comparison.ReadableComplexity, problem.Comparison.OptimalComplexity },
            }),
            Terms = context.Terms.Single().Content,
            Messages = context.AnimationMessages
                .OrderBy(message => message.ProblemId)
                .ThenBy(message => message.Version)
                .ThenBy(message => message.Step)
                .Select(message => new { message.ProblemId, message.Version, message.Step, message.Text })
                .ToList(),
        };

        return JsonSerializer.Serialize(content);
    }
}
