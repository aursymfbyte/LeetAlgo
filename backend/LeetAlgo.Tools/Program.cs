using LeetAlgo.Data;
using LeetAlgo.Data.Models;
using LeetAlgo.Tools;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

if (args.Length != 2 || string.IsNullOrWhiteSpace(args[1]) ||
    args[0] is not ("import" or "export" or "create-admin"))
{
    Console.Error.WriteLine("可用的指令：import <資料夾>、export <資料夾>、create-admin <帳號>");
    return 1;
}

IConfiguration configuration = new ConfigurationBuilder()
    .SetBasePath(AppContext.BaseDirectory)
    .AddJsonFile("appsettings.json")
    .AddEnvironmentVariables()
    .Build();

DbContextOptions<LeetAlgoContext> options = new DbContextOptionsBuilder<LeetAlgoContext>()
    .UseSqlServer(LeetAlgoContext.ResolveConnectionString(configuration))
    .Options;

using LeetAlgoContext context = new(options);

switch (args[0])
{
    case "import":
        ImportProblems(context, args[1]);
        break;
    case "export":
        return ExportProblems(context, args[1]);
    case "create-admin":
        CreateAdmin(context, args[1]);
        break;
}

return 0;

static void ImportProblems(LeetAlgoContext context, string sourceFolder)
{
    context.Database.Migrate();

    if (context.Stages.Any() || context.CatalogVersions.Any(version => version.Stamp != Guid.Empty))
    {
        Console.WriteLine("題庫已初始化，不重新匯入。");
        return;
    }

    var counts = new SourceDataFolder(sourceFolder).ImportTo(context);
    PrintCounts(counts);
}

static int ExportProblems(LeetAlgoContext context, string targetFolder)
{
    if (Directory.Exists(targetFolder) && Directory.EnumerateFileSystemEntries(targetFolder).Any())
    {
        Console.Error.WriteLine($"資料夾 {targetFolder} 裡已經有檔案，請指定一個新的或空的資料夾。");
        return 1;
    }

    var counts = new SourceDataFolder(targetFolder).ExportFrom(context);
    PrintCounts(counts);
    Console.WriteLine($"已匯出到：{Path.GetFullPath(targetFolder)}");
    return 0;
}

static void PrintCounts(SourceDataCounts counts)
{
    Console.WriteLine($"階段：{counts.Stages}");
    Console.WriteLine($"題目：{counts.Problems}");
    Console.WriteLine($"題解：{counts.Solutions}");
    Console.WriteLine($"兩版比較：{counts.Comparisons}");
    Console.WriteLine($"動畫說明：{counts.AnimationMessages}");
}

static void CreateAdmin(LeetAlgoContext context, string userName)
{
    if (context.Admins.Any(admin => admin.UserName == userName))
    {
        Console.WriteLine($"帳號 {userName} 已經存在。");
        return;
    }

    Console.Write("請輸入密碼：");
    string password = PasswordInput.Read();
    Console.Write("請再輸入一次：");
    string confirmation = PasswordInput.Read();

    if (password != confirmation)
    {
        Console.WriteLine("兩次輸入的密碼不同，沒有建立帳號。");
        return;
    }

    Admin admin = new() { UserName = userName };
    admin.PasswordHash = new PasswordHasher<Admin>().HashPassword(admin, password);
    context.Admins.Add(admin);
    context.SaveChanges();

    Console.WriteLine($"已建立管理者帳號：{userName}");
}
