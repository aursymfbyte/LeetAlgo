using System.Data;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;
using LeetAlgo.Data;
using LeetAlgo.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace LeetAlgo.Tools;

public class SourceDataFolder(string sourceFolder)
{
    private const string ProblemListFile = "problems.json";
    private const string TermsFile = "terms.md";
    private const string AnimationMessagesFile = "animation-messages.json";
    private const string StatementFile = "題目.md";
    private const string AnalysisFile = "複雜度說明.md";
    private const string ReadableFolder = "可讀性版";
    private const string DifficultyPrefix = "- 難度：";
    private const string LinkPrefix = "- 連結：";

    private static readonly Dictionary<string, string> LanguageFiles = new()
    {
        ["cs"] = "Solution.cs",
        ["py"] = "solution.py",
        ["c"] = "solution.c",
        ["cpp"] = "solution.cpp",
    };

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        WriteIndented = true,
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    public SourceDataCounts ImportTo(LeetAlgoContext context)
    {
        ProblemList problemList = ReadJson<ProblemList>(ProblemListFile);
        Dictionary<string, Stage> stages = CreateStages(problemList.Stages);

        List<Problem> problems = CreateProblems(problemList, stages);
        List<AnimationMessage> messages = CreateAnimationMessages();
        context.Stages.AddRange(stages.Values);
        context.Problems.AddRange(problems);
        context.AnimationMessages.AddRange(messages);
        context.Terms.Single().Content = ReadText(Path.Combine(sourceFolder, TermsFile));
        context.AdvanceCatalogVersion();
        context.SaveChanges();
        return Counts(stages.Count, problems, messages.Count);
    }

    public SourceDataCounts ExportFrom(LeetAlgoContext context)
    {
        List<StageEntry> stages;
        List<Problem> problems;
        List<AnimationMessageEntry> messages;
        string terms;
        using (var transaction = context.Database.IsRelational() ? context.Database.BeginTransaction(IsolationLevel.Serializable) : null)
        {
            stages = context.Stages
                .OrderBy(stage => stage.SortOrder)
                .Select(stage => new StageEntry(stage.Code, stage.Name))
                .ToList();
            problems = context.Problems.AsNoTracking()
                .Include(problem => problem.Stage)
                .Include(problem => problem.Solutions)
                .Include(problem => problem.Comparison)
                .OrderBy(problem => problem.Stage.SortOrder)
                .ThenBy(problem => problem.Id)
                .ToList();
            messages = context.AnimationMessages
                .OrderBy(message => message.ProblemId)
                .ThenBy(message => message.Version)
                .ThenBy(message => message.Step)
                .Select(message => new AnimationMessageEntry(message.ProblemId, message.Version, message.Step, message.Text))
                .ToList();
            terms = context.Terms.Select(row => row.Content).Single();
            transaction?.Commit();
        }

        List<ProblemEntry> entries = [];
        foreach (Problem problem in problems)
        {
            ProblemEntry entry = ToEntry(problem);
            StageEntry stage = stages.First(item => item.Code == entry.Stage);
            WriteProblemFiles(problem, ProblemFolder(stage, entry));
            entries.Add(entry);
        }

        WriteJson(ProblemListFile, new ProblemList(stages, entries));
        WriteJson(AnimationMessagesFile, messages);
        WriteText(Path.Combine(sourceFolder, TermsFile), terms);
        return Counts(stages.Count, problems, messages.Count);
    }

    private static SourceDataCounts Counts(int stages, List<Problem> problems, int messages)
    {
        return new SourceDataCounts(stages, problems.Count, problems.Sum(problem => problem.Solutions.Count),
            problems.Count(problem => problem.Comparison != null), messages);
    }

    private string ProblemFolder(StageEntry stage, ProblemEntry problem, bool importing = false)
    {
        string stageFolder = $"{stage.Code.Replace(" ", "")}-{stage.Name.Replace("、", "")}";
        string stagePath = Path.Combine(sourceFolder, "solutions", stageFolder);
        string number = problem.Id.ToString("D4");
        string name = $"{number}-{problem.Title}";
        string namedFolder = Path.Combine(stagePath, name);
        if (Encoding.UTF8.GetByteCount(name) <= 255)
        {
            return namedFolder;
        }

        string numberedFolder = Path.Combine(stagePath, number);
        if (importing && !Directory.Exists(numberedFolder) && Directory.Exists(namedFolder))
        {
            return namedFolder;
        }
        return numberedFolder;
    }

    private static Dictionary<string, Stage> CreateStages(List<StageEntry> entries)
    {
        Dictionary<string, Stage> stages = new();
        for (int index = 0; index < entries.Count; index++)
        {
            StageEntry entry = entries[index];
            stages.Add(entry.Code, new Stage { Code = entry.Code, Name = entry.Name, SortOrder = index });
        }
        return stages;
    }

    private List<Problem> CreateProblems(ProblemList problemList, Dictionary<string, Stage> stages)
    {
        List<Problem> problems = [];
        foreach (ProblemEntry entry in problemList.Problems)
        {
            StageEntry stageEntry = problemList.Stages.First(stage => stage.Code == entry.Stage);
            string folder = ProblemFolder(stageEntry, entry, importing: true);
            problems.Add(CreateProblem(entry, stages[entry.Stage], folder));
        }
        return problems;
    }

    private static Problem CreateProblem(ProblemEntry entry, Stage stage, string folder)
    {
        Statement statement = ReadStatement(Path.Combine(folder, StatementFile));
        Problem problem = new()
        {
            Id = entry.Id,
            Title = entry.Title,
            Stage = stage,
            Difficulty = statement.Difficulty,
            Link = statement.Link,
            Statement = statement.Body,
            Complexity = entry.Complexity,
            ComplexityAnalysis = ReadText(Path.Combine(folder, AnalysisFile)),
        };

        foreach (KeyValuePair<string, string> languageFile in LanguageFiles)
        {
            problem.Solutions.Add(new Solution
            {
                Language = languageFile.Key,
                Version = Solution.Optimal,
                Code = ReadText(Path.Combine(folder, languageFile.Value)),
            });
        }

        foreach (string language in entry.Readable)
        {
            problem.Solutions.Add(new Solution
            {
                Language = language,
                Version = Solution.Readable,
                Code = ReadText(Path.Combine(folder, ReadableFolder, LanguageFiles[language])),
            });
        }

        if (entry.Comparison != null)
        {
            problem.Comparison = new Comparison
            {
                ReadableComplexity = entry.Comparison.Readable,
                OptimalComplexity = entry.Comparison.Optimal,
            };
        }

        return problem;
    }

    private List<AnimationMessage> CreateAnimationMessages()
    {
        return ReadJson<List<AnimationMessageEntry>>(AnimationMessagesFile)
            .Select(entry => new AnimationMessage
            {
                ProblemId = entry.ProblemId,
                Version = entry.Version,
                Step = entry.Step,
                Text = entry.Text,
            })
            .ToList();
    }

    private static Statement ReadStatement(string path)
    {
        string[] lines = File.ReadAllLines(path);
        string difficulty = "";
        string link = "";
        int bodyStart = 1;
        while (bodyStart < lines.Length && string.IsNullOrWhiteSpace(lines[bodyStart]))
        {
            bodyStart++;
        }

        while (bodyStart < lines.Length)
        {
            string line = lines[bodyStart];
            if (line.StartsWith(DifficultyPrefix, StringComparison.Ordinal))
            {
                difficulty = line.Substring(DifficultyPrefix.Length).Trim();
            }
            else if (line.StartsWith(LinkPrefix, StringComparison.Ordinal))
            {
                link = line.Substring(LinkPrefix.Length).Trim();
            }
            else
            {
                break;
            }
            bodyStart++;
        }

        if (bodyStart < lines.Length && string.IsNullOrWhiteSpace(lines[bodyStart]))
        {
            bodyStart++;
        }
        return new Statement(difficulty, link, string.Join('\n', lines.Skip(bodyStart)));
    }

    private static ProblemEntry ToEntry(Problem problem)
    {
        Dictionary<string, string> readableCodes = problem.CodesOf(Solution.Readable);
        List<string> readable = LanguageFiles.Keys.Where(readableCodes.ContainsKey).ToList();

        ComparisonEntry? comparison = null;
        if (problem.Comparison != null)
        {
            comparison = new ComparisonEntry(problem.Comparison.ReadableComplexity, problem.Comparison.OptimalComplexity);
        }

        return new ProblemEntry(problem.Id, problem.Title, problem.Stage.Code, problem.Complexity, readable, comparison);
    }

    private static void WriteProblemFiles(Problem problem, string folder)
    {
        string statement = $"# {problem.Id}. {problem.Title}\n\n{DifficultyPrefix}{problem.Difficulty}\n{LinkPrefix}{problem.Link}\n\n{problem.Statement}";
        WriteText(Path.Combine(folder, StatementFile), statement);
        WriteText(Path.Combine(folder, AnalysisFile), problem.ComplexityAnalysis);

        foreach (Solution solution in problem.Solutions)
        {
            string solutionFolder = solution.Version == Solution.Readable ? Path.Combine(folder, ReadableFolder) : folder;
            WriteText(Path.Combine(solutionFolder, LanguageFiles[solution.Language]), solution.Code);
        }
    }

    private T ReadJson<T>(string fileName)
    {
        string json = File.ReadAllText(Path.Combine(sourceFolder, fileName));
        return JsonSerializer.Deserialize<T>(json, JsonOptions)!;
    }

    private void WriteJson<T>(string fileName, T value)
    {
        WriteText(Path.Combine(sourceFolder, fileName), JsonSerializer.Serialize(value, JsonOptions));
    }

    private static string ReadText(string path)
    {
        string text = File.ReadAllText(path).Replace("\r\n", "\n");
        return text.EndsWith('\n') ? text[..^1] : text;
    }

    private static void WriteText(string path, string text)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        File.WriteAllText(path, text.Replace("\r\n", "\n") + "\n");
    }
}
