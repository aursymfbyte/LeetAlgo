using System.Diagnostics;
using LeetAlgo.Data;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace LeetAlgo.Api;

public static class SiteOperations
{
    public static void AddSiteOperations(this WebApplicationBuilder builder)
    {
        builder.Logging.AddJsonConsole(options =>
        {
            options.IncludeScopes = true;
            options.UseUtcTimestamp = true;
            options.TimestampFormat = "O";
        });
        builder.Services.AddHealthChecks().AddCheck<DatabaseHealthCheck>("sql", timeout: TimeSpan.FromSeconds(3));
        builder.Services.AddOutputCache(options =>
        {
            options.AddPolicy("Stages", policy => policy.Expire(TimeSpan.FromMinutes(10))
                .SetVaryByQuery(Array.Empty<string>()).SetVaryByHeader("Origin", "Accept"));
            options.AddPolicy("Problems", policy => policy.Expire(TimeSpan.FromMinutes(2))
                .SetVaryByQuery(Array.Empty<string>()).SetVaryByHeader("Origin", "Accept")
                .VaryByValue(async (http, cancellation) =>
                {
                    var db = http.RequestServices.GetRequiredService<LeetAlgoContext>();
                    Guid version = await db.CatalogVersions.Select(row => row.Stamp).SingleAsync(cancellation);
                    return new KeyValuePair<string, string>("version", version.ToString("N"));
                }));
        });
    }

    public static void UseSiteDiagnostics(this WebApplication app)
    {
        app.UseExceptionHandler(new ExceptionHandlerOptions
        {
            SuppressDiagnosticsCallback = _ => true,
            ExceptionHandler = async http =>
            {
                var error = http.Features.Get<IExceptionHandlerPathFeature>()!;
                string traceId = Activity.Current?.TraceId.ToString() ?? http.TraceIdentifier;
                http.Response.Headers["X-Trace-Id"] = traceId;
                app.Logger.LogError(error.Error, "Request failed {Method} {Path} {TraceId}",
                    http.Request.Method, error.Path, traceId);
                await Results.Problem(statusCode: 500, title: "伺服器暫時無法完成請求。",
                    extensions: new Dictionary<string, object?> { ["traceId"] = traceId }).ExecuteAsync(http);
            }
        });

        app.Use(async (http, next) =>
        {
            await next();
            if (http.User.Identity?.IsAuthenticated == true && !HttpMethods.IsGet(http.Request.Method))
            {
                app.Logger.LogInformation("Admin request {Admin} {Method} {Path} {StatusCode} {TraceId}",
                    http.User.Identity.Name, http.Request.Method, http.Request.Path.Value, http.Response.StatusCode,
                    Activity.Current?.TraceId.ToString() ?? http.TraceIdentifier);
            }
        });

        app.MapHealthChecks("/health/live", new HealthCheckOptions { Predicate = _ => false });
        app.MapHealthChecks("/health/ready");
    }
}

internal sealed class DatabaseHealthCheck(LeetAlgoContext db) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken)
    {
        await db.Database.SqlQuery<int>($"SELECT 1 AS Value").SingleAsync(cancellationToken);
        return HealthCheckResult.Healthy();
    }
}
