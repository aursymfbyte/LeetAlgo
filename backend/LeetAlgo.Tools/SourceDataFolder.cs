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

    public void ImportTo(LeetAlgoContext context)
    {
        ProblemList problemList = ReadJson<ProblemList>(ProblemListFile);
        Dictionary<string, Stage> stages = CreateStages(problemList.Stages);

        context.Stages.AddRange(stages.Values);
        context.Problems.AddRange(CreateProblems(problemList, stages));
        context.AnimationMessages.AddRange(CreateAnimationMessages());
        context.Terms.Single().Content = ReadText(Path.Combine(sourceFolder, TermsFile));
        context.SaveChanges();
    }

    public void ExportFrom(LeetAlgoContext context)
    {
        List<StageEntry> stages = context.Stages
            .OrderBy(stage => stage.SortOrder)
            .Select(stage => new StageEntry(stage.Code, stage.Name))
            .ToList();
        List<Problem> problems = context.Problems
            .Include(problem => problem.Stage)
            .Include(problem => problem.Solutions)
            .Include(problem => problem.Comparison)
            .OrderBy(problem => problem.Stage.SortOrder)
            .ThenBy(problem => problem.Id)
            .ToList();

        List<ProblemEntry> entries = [];
        foreach (Problem problem in problems)
        {
            ProblemEntry entry = ToEntry(problem);
            StageEntry stage = stages.First(item => item.Code == entry.Stage);
            WriteProblemFiles(problem, ProblemFolder(stage, entry));
            entries.Add(entry);
        }

        List<AnimationMessageEntry> messages = context.AnimationMessages
            .OrderBy(message => message.ProblemId)
            .ThenBy(message => message.Version)
            .ThenBy(message => message.Step)
            .Select(message => new AnimationMessageEntry(message.ProblemId, message.Version, message.Step, message.Text))
            .ToList();

        WriteJson(ProblemListFile, new ProblemList(stages, entries));
        WriteJson(AnimationMessagesFile, messages);
        WriteText(Path.Combine(sourceFolder, TermsFile), context.Terms.Single().Content);
    }

    private string ProblemFolder(StageEntry stage, ProblemEntry problem)
    {
        string stageFolder = $"{stage.Code.Replace(" ", "")}-{stage.Name.Replace("、", "")}";
        string problemFolder = $"{problem.Id:D4}-{problem.Title}";
        return Path.Combine(sourceFolder, "solutions", stageFolder, problemFolder);
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
            string folder = ProblemFolder(stageEntry, entry);
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
        string[] lines = ReadText(path).Split('\n');
        string difficulty = "";
        string link = "";
        List<string> body = [];

        foreach (string line in lines.Skip(1))
        {
            if (line.StartsWith(DifficultyPrefix))
            {
                difficulty = line.Substring(DifficultyPrefix.Length).Trim();
            }
            else if (line.StartsWith(LinkPrefix))
            {
                link = line.Substring(LinkPrefix.Length).Trim();
            }
            else
            {
                body.Add(line);
            }
        }

        return new Statement(difficulty, link, string.Join("\n", body).Trim());
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
        return File.ReadAllText(path).Replace("\r\n", "\n").Trim();
    }

    private static void WriteText(string path, string text)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        File.WriteAllText(path, text.Replace("\r\n", "\n") + "\n");
    }
}
