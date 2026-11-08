using System.Text.Json;
using System.Text.RegularExpressions;
using LeetAlgo.Data;
using LeetAlgo.Data.Models;

namespace LeetAlgo.Tools;

public class ProblemImporter(string sourceFolder)
{
    private static readonly Dictionary<string, string> LanguageFiles = new()
    {
        ["cs"] = "Solution.cs",
        ["py"] = "solution.py",
        ["c"] = "solution.c",
        ["cpp"] = "solution.cpp",
    };

    public void ImportTo(LeetAlgoContext context)
    {
        ProblemList problemList = ReadProblemList();
        Dictionary<string, Stage> stages = CreateStages(problemList.Stages);

        context.Stages.AddRange(stages.Values);
        context.Problems.AddRange(CreateProblems(problemList, stages));
        context.Comparisons.AddRange(CreateComparisons());
        context.SaveChanges();
    }

    private ProblemList ReadProblemList()
    {
        string json = File.ReadAllText(Path.Combine(sourceFolder, "problems.json"));
        JsonSerializerOptions options = new() { PropertyNameCaseInsensitive = true };
        return JsonSerializer.Deserialize<ProblemList>(json, options)!;
    }

    private static Dictionary<string, Stage> CreateStages(List<StageEntry> entries)
    {
        Dictionary<string, Stage> stages = new();
        for (int index = 0; index < entries.Count; index++)
        {
            StageEntry entry = entries[index];
            stages.Add(entry.Id, new Stage { Code = entry.Id, Name = entry.Name, SortOrder = index });
        }
        return stages;
    }

    private List<Problem> CreateProblems(ProblemList problemList, Dictionary<string, Stage> stages)
    {
        List<Problem> problems = [];
        foreach (ProblemEntry entry in problemList.Problems)
        {
            StageEntry stageEntry = problemList.Stages.First(stage => stage.Id == entry.Stage);
            string folder = Path.Combine(sourceFolder, "solutions", stageEntry.Folder, entry.Folder);
            problems.Add(CreateProblem(entry, stages[entry.Stage], folder));
        }
        return problems;
    }

    private static Problem CreateProblem(ProblemEntry entry, Stage stage, string folder)
    {
        Statement statement = ReadStatement(Path.Combine(folder, "題目.md"));
        Problem problem = new()
        {
            Id = entry.Id,
            Title = entry.Title,
            Stage = stage,
            Difficulty = statement.Difficulty,
            Link = statement.Link,
            Statement = statement.Body,
            Complexity = entry.Complexity,
            ComplexityAnalysis = ReadText(Path.Combine(folder, "複雜度說明.md")),
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
                Code = ReadText(Path.Combine(folder, "可讀性版", LanguageFiles[language])),
            });
        }

        return problem;
    }

    private static Statement ReadStatement(string path)
    {
        string[] lines = ReadText(path).Split('\n');
        string difficulty = "";
        string link = "";
        List<string> body = [];

        foreach (string line in lines.Skip(1))
        {
            if (line.StartsWith("- 難度："))
            {
                difficulty = line.Substring("- 難度：".Length).Trim();
            }
            else if (line.StartsWith("- 連結："))
            {
                link = line.Substring("- 連結：".Length).Trim();
            }
            else
            {
                body.Add(line);
            }
        }

        return new Statement(difficulty, link, string.Join("\n", body).Trim());
    }

    private List<Comparison> CreateComparisons()
    {
        Regex rowPattern = new(@"\{ id: (\d+), readable: ""(.*)"", optimal: ""(.*)"" \}");
        List<Comparison> comparisons = [];

        foreach (string line in File.ReadLines(Path.Combine(sourceFolder, "compare.ts")))
        {
            Match match = rowPattern.Match(line);
            if (match.Success)
            {
                comparisons.Add(new Comparison
                {
                    ProblemId = int.Parse(match.Groups[1].Value),
                    ReadableComplexity = match.Groups[2].Value,
                    OptimalComplexity = match.Groups[3].Value,
                });
            }
        }

        return comparisons;
    }

    private static string ReadText(string path)
    {
        return File.ReadAllText(path).Replace("\r\n", "\n").Trim();
    }
}
