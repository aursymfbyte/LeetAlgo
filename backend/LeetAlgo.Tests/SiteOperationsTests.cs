using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using LeetAlgo.Api.Controllers;
using LeetAlgo.Api.Dtos;
using LeetAlgo.Data;
using LeetAlgo.Data.Models;
using LeetAlgo.Tools;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace LeetAlgo.Tests;

[Collection(SqlServerCollection.Name)]
public class SiteOperationsTests(SqlServerFixture fixture)
{
    [Fact]
    public async Task PublicCatalogReflectsWritesFromAnotherInstance()
    {
        using LeetAlgoContext db = fixture.CreateMigratedContext();
        string connection = db.Database.GetConnectionString()!;
        using var writer = CreateServer(connection);
        using var reader = CreateServer(connection);
        using HttpClient editor = writer.CreateClient();
        using HttpClient visitor = reader.CreateClient();
        Assert.Empty((await visitor.GetFromJsonAsync<List<StageDto>>("/api/stages"))!);
        new SourceDataFolder(TestDatabase.RepositorySourceData).ImportTo(db);
        Assert.NotEmpty((await visitor.GetFromJsonAsync<List<StageDto>>("/api/stages"))!);
        await SignIn(editor, db);

        Assert.Equal("Healthy", await visitor.GetStringAsync("/health/ready"));
        string original = await visitor.GetStringAsync("/api/problems");
        using var cached = await visitor.GetAsync("/api/problems");
        Assert.NotNull(cached.Headers.Age);
        var dto = await editor.GetFromJsonAsync<ProblemEditDto>("/api/admin/problems/1");
        var created = dto! with { Id = 987654, Title = "catalog-create" };
        using var post = await editor.PostAsJsonAsync("/api/admin/problems", created);
        Assert.Equal(HttpStatusCode.Created, post.StatusCode);
        var listed = (await visitor.GetFromJsonAsync<List<ProblemSummaryDto>>("/api/problems"))!.Single(p => p.Id == created.Id);
        Assert.Equal("catalog-create", listed.Title);
        var saved = await post.Content.ReadFromJsonAsync<ProblemEditDto>();
        string path = "/api/admin/problems/987654";
        using var put = await editor.PutAsJsonAsync(path, saved! with { Title = "catalog-update" });
        Assert.Equal(HttpStatusCode.OK, put.StatusCode);
        Assert.Contains("catalog-update", await visitor.GetStringAsync("/api/problems"));
        using var stale = await editor.PutAsJsonAsync(path, saved);
        Assert.Equal(HttpStatusCode.Conflict, stale.StatusCode);
        using var missingVersion = await editor.DeleteAsync(path);
        Assert.Equal(HttpStatusCode.Conflict, missingVersion.StatusCode);
        using var staleDelete = await editor.DeleteAsync($"{path}?revision={listed.Revision}");
        Assert.Equal(HttpStatusCode.Conflict, staleDelete.StatusCode);
        var latest = (await visitor.GetFromJsonAsync<List<ProblemSummaryDto>>("/api/problems"))!.Single(p => p.Id == created.Id);
        Assert.Equal("catalog-update", latest.Title);
        using var delete = await editor.DeleteAsync($"{path}?revision={latest.Revision}");
        Assert.Equal(HttpStatusCode.NoContent, delete.StatusCode);
        Assert.Equal(original, await visitor.GetStringAsync("/api/problems"));
    }

    [Fact]
    public async Task UnavailableDatabaseFailsReadinessAndReturnsSafeErrorWithTraceId()
    {
        using LeetAlgoContext db = fixture.CreateMigratedContext();
        var connection = new SqlConnectionStringBuilder(db.Database.GetConnectionString())
        {
            InitialCatalog = $"Missing_{Guid.NewGuid():N}", ConnectTimeout = 1, ConnectRetryCount = 0
        };
        using var server = CreateServer(connection.ConnectionString)
            .WithWebHostBuilder(builder => builder.UseSetting("Database:MigrateOnStartup", "true"));
        using HttpClient client = server.CreateClient();
        Assert.Equal("Healthy", await client.GetStringAsync("/health/live"));
        using var ready = await client.GetAsync("/health/ready");
        Assert.Equal(HttpStatusCode.ServiceUnavailable, ready.StatusCode);
        using var response = await client.GetAsync("/api/problems");
        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(response.Headers.GetValues("X-Trace-Id").Single(), problem.GetProperty("traceId").GetString());
        Assert.DoesNotContain(connection.InitialCatalog, problem.ToString());
    }

    [Fact]
    public async Task AdminWritesRejectInvalidFieldsBeforeSaving()
    {
        using var db = fixture.CreateMigratedContext();
        new SourceDataFolder(TestDatabase.RepositorySourceData).ImportTo(db);
        using var server = CreateServer(db.Database.GetConnectionString()!);
        using var editor = server.CreateClient();
        await SignIn(editor, db);
        const string path = "/api/admin/problems";
        var problem = (await editor.GetFromJsonAsync<ProblemEditDto>($"{path}/1"))!;
        var draft = problem with { Id = 987654 };
        foreach (string title in new[] { "半形?", "尾端.", "尾端 ", "NUL.txt", "LPT²", "控制\u0001字元", new string('長', 201) })
        {
            using var post = await editor.PostAsJsonAsync(path, draft with { Title = title });
            Assert.Equal(HttpStatusCode.BadRequest, post.StatusCode);
            var result = await post.Content.ReadFromJsonAsync<JsonElement>();
            Assert.True(result.GetProperty("errors").TryGetProperty("Title", out _));
        }
        var tooLong = new string('長', 301);
        var invalid = problem with {
            Title = "斜線/", Link = tooLong, Complexity = tooLong, Stage = tooLong, Difficulty = tooLong,
            Comparison = new ComparisonEditDto(tooLong, tooLong)
        };
        using var put = await editor.PutAsJsonAsync($"{path}/1", invalid);
        Assert.Equal(HttpStatusCode.BadRequest, put.StatusCode);
        var validation = await put.Content.ReadFromJsonAsync<JsonElement>();
        var errors = validation.GetProperty("errors");
        foreach (string field in new[] { "Title", "Link", "Complexity", "Stage", "Difficulty", "Comparison.ReadableComplexity", "Comparison.OptimalComplexity" })
        {
            Assert.True(errors.TryGetProperty(field, out _), field);
        }
        var unchanged = (await editor.GetFromJsonAsync<ProblemEditDto>($"{path}/1"))!;
        Assert.Equal(problem.Revision, unchanged.Revision);

        var valid = draft with { Title = new string('字', 199) + "？", Link = new string('a', 300) };
        using var accepted = await editor.PostAsJsonAsync(path, valid);
        Assert.Equal(HttpStatusCode.Created, accepted.StatusCode);
    }

    private static async Task SignIn(HttpClient editor, LeetAlgoContext db)
    {
        string password = Guid.NewGuid().ToString("N");
        Admin admin = new() { UserName = "catalog-test" };
        admin.PasswordHash = new PasswordHasher<Admin>().HashPassword(admin, password);
        db.Admins.Add(admin);
        db.SaveChanges();
        using var login = await editor.PostAsJsonAsync("/api/auth/login", new LoginRequest(admin.UserName, password));
        login.EnsureSuccessStatusCode();
        var token = await login.Content.ReadFromJsonAsync<LoginResponse>();
        editor.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token!.Token);
    }

    private static WebApplicationFactory<ProblemsController> CreateServer(string connection)
    {
        return new WebApplicationFactory<ProblemsController>().WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Production");
            builder.UseSetting("ConnectionStrings:LeetAlgo", connection);
            builder.UseSetting("RateLimiting:AtGateway", "true");
            builder.UseSetting("Jwt:Issuer", "LeetAlgo-tests");
            builder.UseSetting("Jwt:Audience", "LeetAlgo-tests");
            builder.UseSetting("Jwt:ExpireHours", "1");
            builder.UseSetting("Jwt:Key", Guid.NewGuid().ToString("N"));
        });
    }
}
