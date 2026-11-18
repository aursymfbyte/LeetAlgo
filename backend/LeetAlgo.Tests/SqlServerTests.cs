using System.Diagnostics;
using System.Reflection;
using System.Text;
using LeetAlgo.Api.Controllers;
using LeetAlgo.Api.Dtos;
using LeetAlgo.Data;
using LeetAlgo.Data.Models;
using LeetAlgo.Tools;
using Microsoft.AspNetCore.Mvc;
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
    public void AddProblemRevision_AssignsVersionsToExistingProblems()
    {
        using LeetAlgoContext context = CreateContextWithOneProblem();
        context.ChangeTracker.Clear();
        context.Database.Migrate("20261115092049_AddAnimationMessages");

        context.Database.Migrate();

        Problem problem = context.Problems.Include(problem => problem.Solutions).Single();
        Assert.NotEqual(Guid.Empty, problem.Revision);
        Assert.Equal("題目 1", problem.Title);
        Assert.Equal("return 0;", Assert.Single(problem.Solutions).Code);
    }

    [Fact]
    public void ImportTo_WithRepositorySourceData_FitsTheColumnLimits()
    {
        using LeetAlgoContext context = fixture.CreateMigratedContext();

        new SourceDataFolder(TestDatabase.RepositorySourceData).ImportTo(context);

        Assert.NotEmpty(context.Problems);
    }

    [Fact]
    public async Task ExportCommand_ReportsSuccessThenRefusesToOverwriteTheBackup()
    {
        using LeetAlgoContext context = CreateContextWithOneProblem();
        DirectoryInfo folder = Directory.CreateTempSubdirectory("LeetAlgoExport_");
        try
        {
            string configuration = typeof(SqlServerTests).Assembly.GetCustomAttribute<AssemblyConfigurationAttribute>()!.Configuration;
            ProcessStartInfo command = new("dotnet")
            {
                WorkingDirectory = TestDatabase.ToolsProjectDirectory,
                UseShellExecute = false,
                RedirectStandardError = true,
                StandardErrorEncoding = Encoding.UTF8,
                ArgumentList = { "run", "--no-build", "--configuration", configuration, "--", "export", folder.FullName },
            };
            command.Environment["ConnectionStrings__LeetAlgo"] = context.Database.GetConnectionString();
            using Process first = Process.Start(command)!;
            string firstError = await first.StandardError.ReadToEndAsync();
            await first.WaitForExitAsync();
            Assert.True(first.ExitCode == 0, firstError);
            string backupFile = Path.Combine(folder.FullName, "problems.json");
            string backup = File.ReadAllText(backupFile);
            Assert.Contains("題目 1", backup);
            context.Problems.Single().Title = "匯出後修改";
            context.SaveChanges();

            using Process second = Process.Start(command)!;
            string secondError = await second.StandardError.ReadToEndAsync();
            await second.WaitForExitAsync();

            Assert.Equal(1, second.ExitCode);
            Assert.Contains("裡已經有檔案", secondError);
            Assert.Equal(backup, File.ReadAllText(backupFile));
        }
        finally
        {
            folder.Delete(recursive: true);
        }
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

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task UpdateProblem_StaleTabCannotOverwriteSolutionOrComparison(bool reloadBeforeSave)
    {
        using LeetAlgoContext first = fixture.CreateMigratedContext();
        new SourceDataFolder(TestDatabase.RepositorySourceData).ImportTo(first);
        var options = new DbContextOptionsBuilder<LeetAlgoContext>()
            .UseSqlServer(first.Database.GetConnectionString()).Options;
        using LeetAlgoContext second = new(options);
        AdminProblemsController firstTab = new(first);
        AdminProblemsController secondTab = new(second);
        ProblemEditDto original = (await firstTab.GetProblem(ProblemId)).Value!;
        ProblemEditDto draft = (await secondTab.GetProblem(ProblemId)).Value!;
        var codes = new Dictionary<string, string>(original.Optimal) { ["cs"] = "新版 C#" };
        var comparison = new ComparisonEditDto("新版可讀性分析", "新版效能分析");

        var saved = await firstTab.UpdateProblem(ProblemId, original with { Optimal = codes, Comparison = comparison });
        Assert.NotNull(saved.Value);
        Assert.NotEqual(original.Revision, saved.Value.Revision);
        if (reloadBeforeSave)
        {
            second.ChangeTracker.Clear();
        }
        var stale = await secondTab.UpdateProblem(ProblemId, draft with { Title = "舊分頁草稿" });

        Assert.IsType<ConflictObjectResult>(stale.Result);
        second.ChangeTracker.Clear();
        var latest = (await secondTab.GetProblem(ProblemId)).Value!;
        Assert.Equal(original.Title, latest.Title);
        Assert.Equal(codes, latest.Optimal);
        Assert.Equal(comparison, latest.Comparison);
        Assert.Equal(saved.Value.Revision, latest.Revision);
        var missingVersion = await secondTab.UpdateProblem(ProblemId, latest with { Revision = null });
        Assert.IsType<ConflictObjectResult>(missingVersion.Result);
        var merged = await secondTab.UpdateProblem(ProblemId, latest with { Title = "合併後的題名" });
        Assert.Equal("合併後的題名", merged.Value!.Title);
    }

    [Fact]
    public async Task UpdateProblem_FailedSaveRollsBackRevisionAndContent()
    {
        using LeetAlgoContext context = fixture.CreateMigratedContext();
        new SourceDataFolder(TestDatabase.RepositorySourceData).ImportTo(context);
        AdminProblemsController controller = new(context);
        ProblemEditDto original = (await controller.GetProblem(ProblemId)).Value!;
        var invalid = original with { Title = new string('長', 201), Readable = [] };

        await Assert.ThrowsAsync<DbUpdateException>(() => controller.UpdateProblem(ProblemId, invalid));

        context.ChangeTracker.Clear();
        ProblemEditDto latest = (await controller.GetProblem(ProblemId)).Value!;
        Assert.Equal(original.Revision, latest.Revision);
        Assert.Equal(original.Title, latest.Title);
        Assert.Equal(original.Readable, latest.Readable);
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
    public async Task ClearVisits_RemovesAllDatesAndCountsReturningVisitorsAgain()
    {
        using LeetAlgoContext context = CreateContextWithOneProblem();
        VisitsController controller = new(context);
        VisitRequest visitor = new(Guid.NewGuid());
        DateOnly start = new(2020, 1, 1);
        for (int day = 0; day < 31; day++)
        {
            context.Visits.Add(new Visit { Date = start.AddDays(day), VisitorId = visitor.VisitorId });
        }
        await context.SaveChangesAsync();
        await controller.RecordVisit(visitor);
        Assert.Equal(30, (await controller.GetVisits()).Days.Count);

        Assert.IsType<NoContentResult>(await controller.ClearVisits());
        VisitStatsDto cleared = await controller.GetVisits();
        Assert.Equal(0, cleared.TotalVisitors);
        Assert.Empty(cleared.Days);
        Assert.Single(context.Problems);

        await controller.RecordVisit(visitor);
        await controller.RecordVisit(visitor);
        VisitStatsDto restarted = await controller.GetVisits();
        Assert.Equal(1, restarted.TotalVisitors);
        Assert.Equal(1, Assert.Single(restarted.Days).Visitors);
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
