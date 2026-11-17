using LeetAlgo.Api.Controllers;
using LeetAlgo.Api.Dtos;
using LeetAlgo.Data;
using LeetAlgo.Data.Models;
using LeetAlgo.Tools;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Testcontainers.MsSql;

namespace LeetAlgo.Tests;

public class SqlServerFixture : IAsyncLifetime
{
    private readonly MsSqlContainer container = new MsSqlBuilder("mcr.microsoft.com/mssql/server:2022-latest").Build();

    public Task InitializeAsync()
    {
        return container.StartAsync();
    }

    public Task DisposeAsync()
    {
        return container.DisposeAsync().AsTask();
    }

    public LeetAlgoContext CreateMigratedContext()
    {
        SqlConnectionStringBuilder connection = new(container.GetConnectionString())
        {
            InitialCatalog = $"LeetAlgoTest_{Guid.NewGuid():N}",
        };
        DbContextOptions<LeetAlgoContext> options = new DbContextOptionsBuilder<LeetAlgoContext>()
            .UseSqlServer(connection.ConnectionString)
            .Options;

        LeetAlgoContext context = new(options);
        context.Database.Migrate();
        return context;
    }
}

[CollectionDefinition(Name)]
public class SqlServerCollection : ICollectionFixture<SqlServerFixture>
{
    public const string Name = "SQL Server";
}

[Collection(SqlServerCollection.Name)]
public class SqlServerTests(SqlServerFixture fixture)
{
    private const int DuplicateKeyError = 2601;
    private const int ProblemId = 1;

    [Fact]
    public void Migrations_MatchTheModel()
    {
        using LeetAlgoContext context = fixture.CreateMigratedContext();

        Assert.Empty(context.Database.GetPendingMigrations());
        Assert.False(context.Database.HasPendingModelChanges());
        Assert.Single(context.Terms);
    }

    [Fact]
    public void ImportTo_WithRepositorySourceData_FitsTheColumnLimits()
    {
        using LeetAlgoContext context = fixture.CreateMigratedContext();

        new SourceDataFolder(TestDatabase.RepositorySourceData).ImportTo(context);

        Assert.NotEmpty(context.Problems);
    }

    [Fact]
    public async Task ReadEndpoints_TranslateToSqlServerQueries()
    {
        using LeetAlgoContext context = fixture.CreateMigratedContext();
        new SourceDataFolder(TestDatabase.RepositorySourceData).ImportTo(context);
        context.Visits.Add(new Visit { Date = new DateOnly(2026, 11, 16), VisitorId = Guid.NewGuid() });
        context.Visits.Add(new Visit { Date = new DateOnly(2026, 11, 17), VisitorId = Guid.NewGuid() });
        context.AnimationMessages.Add(new AnimationMessage { ProblemId = ProblemId, Version = "brute", Step = 0, Text = "改過的說明" });
        context.SaveChanges();
        context.ChangeTracker.Clear();

        List<StageDto> stages = await new StagesController(context).GetStages();
        List<ProblemSummaryDto> problems = await new ProblemsController(context).GetProblems();
        ProblemDetailDto detail = (await new ProblemsController(context).GetProblem(ProblemId)).Value!;
        ProblemEditDto edit = (await new AdminProblemsController(context).GetProblem(ProblemId)).Value!;
        List<ComparisonDto> comparisons = await new ComparisonsController(context).GetComparisons();
        List<AnimationMessageDto> messages = await new AnimationMessagesController(context).GetMessages(ProblemId);
        TermsDto terms = await new TermsController(context).GetTerms();
        VisitStatsDto visits = await new VisitsController(context).GetVisits();

        Assert.NotEmpty(stages);
        Assert.Contains(problems, problem => problem.ReadableLanguages.Count > 0);
        Assert.Equal(4, detail.Optimal.Count);
        Assert.Equal(4, edit.Optimal.Count);
        Assert.NotEmpty(comparisons);
        Assert.Single(messages);
        Assert.NotEqual("", terms.Content);
        Assert.Equal(2, visits.TotalVisitors);
        Assert.Equal(2, visits.Days.Count);
    }

    [Fact]
    public async Task DeleteProblem_RemovesItsSolutionsComparisonAndMessages()
    {
        using LeetAlgoContext context = CreateContextWithOneProblem();
        context.Comparisons.Add(new Comparison { ProblemId = ProblemId, ReadableComplexity = "時間 O(n²)", OptimalComplexity = "時間 O(n)" });
        context.AnimationMessages.Add(new AnimationMessage { ProblemId = ProblemId, Version = "brute", Step = 0, Text = "改過的說明" });
        context.SaveChanges();
        context.ChangeTracker.Clear();

        await new AdminProblemsController(context).DeleteProblem(ProblemId);

        Assert.Empty(context.Problems);
        Assert.Empty(context.Solutions);
        Assert.Empty(context.Comparisons);
        Assert.Empty(context.AnimationMessages);
    }

    [Fact]
    public async Task RecordVisit_SameVisitorTwiceOnSameDay_CountsOnce()
    {
        using LeetAlgoContext context = fixture.CreateMigratedContext();
        VisitsController controller = new(context);
        VisitRequest request = new(Guid.NewGuid());

        await controller.RecordVisit(request);
        await controller.RecordVisit(request);

        Assert.Equal(1, context.Visits.Count());
    }

    [Fact]
    public void DuplicateVisit_IsRejectedWithTheErrorNumberTheControllerCatches()
    {
        using LeetAlgoContext context = fixture.CreateMigratedContext();
        DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow);
        Guid visitorId = Guid.NewGuid();
        context.Visits.Add(new Visit { Date = today, VisitorId = visitorId });
        context.SaveChanges();

        context.Visits.Add(new Visit { Date = today, VisitorId = visitorId });
        DbUpdateException error = Assert.Throws<DbUpdateException>(() => context.SaveChanges());

        SqlException sqlError = Assert.IsType<SqlException>(error.InnerException);
        Assert.Equal(DuplicateKeyError, sqlError.Number);
    }

    [Fact]
    public async Task DeleteMessage_RemovesTheSavedMessage()
    {
        using LeetAlgoContext context = CreateContextWithOneProblem();
        AnimationMessagesController controller = new(context);

        await controller.SaveMessage(ProblemId, new AnimationMessageDto("brute", 0, "改過的說明"));
        await controller.DeleteMessage(ProblemId, "brute", 0);

        Assert.Empty(context.AnimationMessages);
    }

    [Fact]
    public async Task Search_IgnoresLetterCase()
    {
        using LeetAlgoContext context = CreateContextWithOneProblem();
        SearchController controller = new(context);

        SearchResponseDto response = (await controller.Search("RETURN", null)).Value!;

        SearchResultDto result = Assert.Single(response.Results);
        Assert.Equal(ProblemId, result.Id);
        Assert.Equal("cs", result.Place);
    }

    [Fact]
    public void Problem_TitleLongerThanTheColumn_IsRejected()
    {
        using LeetAlgoContext context = fixture.CreateMigratedContext();
        Stage stage = new() { Code = "階段 0", Name = "陣列", SortOrder = 0 };
        Problem problem = TestDatabase.CreateProblem(ProblemId, stage);
        problem.Title = new string('長', 201);
        context.Problems.Add(problem);

        Assert.Throws<DbUpdateException>(() => context.SaveChanges());
    }

    private LeetAlgoContext CreateContextWithOneProblem()
    {
        LeetAlgoContext context = fixture.CreateMigratedContext();
        Stage stage = new() { Code = "階段 0", Name = "陣列", SortOrder = 0 };
        context.Problems.Add(TestDatabase.CreateProblem(ProblemId, stage));
        context.SaveChanges();
        return context;
    }
}
