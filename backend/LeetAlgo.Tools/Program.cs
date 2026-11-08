using LeetAlgo.Data;
using LeetAlgo.Tools;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

IConfiguration configuration = new ConfigurationBuilder()
    .SetBasePath(AppContext.BaseDirectory)
    .AddJsonFile("appsettings.json")
    .AddEnvironmentVariables()
    .Build();

DbContextOptions<LeetAlgoContext> options = new DbContextOptionsBuilder<LeetAlgoContext>()
    .UseSqlServer(configuration.GetConnectionString("LeetAlgo"))
    .Options;

using LeetAlgoContext context = new(options);

string command = args[0];

if (command == "import")
{
    ImportProblems(context, args[1]);
}
else if (command == "create-admin")
{
    CreateAdmin(context, args[1]);
}
else
{
    Console.WriteLine($"不認識的指令：{command}");
    Console.WriteLine("可用的指令：import <資料夾>、create-admin <帳號>");
}

static void ImportProblems(LeetAlgoContext context, string sourceFolder)
{
    if (context.Problems.Any())
    {
        Console.WriteLine("資料庫已經有題目，不重新匯入。");
        return;
    }

    ProblemImporter importer = new(sourceFolder);
    importer.ImportTo(context);

    Console.WriteLine($"階段：{context.Stages.Count()}");
    Console.WriteLine($"題目：{context.Problems.Count()}");
    Console.WriteLine($"題解：{context.Solutions.Count()}");
    Console.WriteLine($"兩版比較：{context.Comparisons.Count()}");
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

    AdminCreator.Create(context, userName, password);
    Console.WriteLine($"已建立管理者帳號：{userName}");
}
