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
        string password = Guid.NewGuid().ToString("N");
        Admin admin = new() { UserName = "catalog-test" };
        admin.PasswordHash = new PasswordHasher<Admin>().HashPassword(admin, password);
        db.Admins.Add(admin);
        db.SaveChanges();
        string connection = db.Database.GetConnectionString()!;
        using var writer = CreateServer(connection);
        using var reader = CreateServer(connection);
        using HttpClient editor = writer.CreateClient();
        using HttpClient visitor = reader.CreateClient();
        Assert.Empty((await visitor.GetFromJsonAsync<List<StageDto>>("/api/stages"))!);
        new SourceDataFolder(TestDatabase.RepositorySourceData).ImportTo(db);
        Assert.NotEmpty((await visitor.GetFromJsonAsync<List<StageDto>>("/api/stages"))!);
        using var login = await editor.PostAsJsonAsync("/api/auth/login", new LoginRequest(admin.UserName, password));
        login.EnsureSuccessStatusCode();
        var token = await login.Content.ReadFromJsonAsync<LoginResponse>();
        editor.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token!.Token);

        Assert.Equal("Healthy", await visitor.GetStringAsync("/health/ready"));
        string original = await visitor.GetStringAsync("/api/problems");
        using var cached = await visitor.GetAsync("/api/problems");
        Assert.NotNull(cached.Headers.Age);
        var dto = await editor.GetFromJsonAsync<ProblemEditDto>("/api/admin/problems/1");
        var created = dto! with { Id = 987654, Title = "catalog-create" };
        using var post = await editor.PostAsJsonAsync("/api/admin/problems", created);
        Assert.Equal(HttpStatusCode.Created, post.StatusCode);
        Assert.Contains("catalog-create", await visitor.GetStringAsync("/api/problems"));
        var saved = await post.Content.ReadFromJsonAsync<ProblemEditDto>();
        string path = "/api/admin/problems/987654";
        using var put = await editor.PutAsJsonAsync(path, saved! with { Title = "catalog-update" });
        Assert.Equal(HttpStatusCode.OK, put.StatusCode);
        Assert.Contains("catalog-update", await visitor.GetStringAsync("/api/problems"));
        using var stale = await editor.PutAsJsonAsync(path, saved);
        Assert.Equal(HttpStatusCode.Conflict, stale.StatusCode);
        using var delete = await editor.DeleteAsync(path);
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
        using var server = CreateServer(connection.ConnectionString);
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

    private static WebApplicationFactory<ProblemsController> CreateServer(string connection)
    {
        return new WebApplicationFactory<ProblemsController>().WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Production");
            builder.UseSetting("ConnectionStrings:LeetAlgo", connection);
            builder.UseSetting("Database:MigrateOnStartup", "false");
            builder.UseSetting("RateLimiting:AtGateway", "true");
            builder.UseSetting("Jwt:Issuer", "LeetAlgo-tests");
            builder.UseSetting("Jwt:Audience", "LeetAlgo-tests");
            builder.UseSetting("Jwt:ExpireHours", "1");
            builder.UseSetting("Jwt:Key", Guid.NewGuid().ToString("N"));
        });
    }
}
