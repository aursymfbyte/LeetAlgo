using LeetAlgo.Data;
using LeetAlgo.Data.Models;
using LeetAlgo.Tools;
using Microsoft.EntityFrameworkCore;

namespace LeetAlgo.Tests;

public class ProblemImporterTests
{
    private const int LanguageCount = 4;

    [Fact]
    public void ImportTo_WithRepositorySourceData_ImportsCompleteProblems()
    {
        using LeetAlgoContext context = TestDatabase.CreateContext();
        string backendFolder = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..");
        string sourceFolder = Path.Combine(backendFolder, "LeetAlgo.Tools", "SourceData");

        new ProblemImporter(sourceFolder).ImportTo(context);

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

        List<int> problemIds = problems.Select(problem => problem.Id).ToList();
        Assert.All(context.Comparisons, comparison => Assert.Contains(comparison.ProblemId, problemIds));
    }
}
