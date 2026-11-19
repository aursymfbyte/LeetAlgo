namespace LeetAlgo.Tools;

public record StageEntry(string Code, string Name);

public record ComparisonEntry(string Readable, string Optimal);

public record ProblemEntry(
    int Id,
    string Title,
    string Stage,
    string Complexity,
    List<string> Readable,
    ComparisonEntry? Comparison);

public record ProblemList(List<StageEntry> Stages, List<ProblemEntry> Problems);

public record AnimationMessageEntry(int ProblemId, string Version, int Step, string Text);

public record Statement(string Difficulty, string Link, string Body);

public record SourceDataCounts(int Stages, int Problems, int Solutions, int Comparisons, int AnimationMessages);
