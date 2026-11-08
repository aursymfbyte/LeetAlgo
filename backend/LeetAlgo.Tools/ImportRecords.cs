namespace LeetAlgo.Tools;

public record StageEntry(string Id, string Name, string Folder);

public record ProblemEntry(int Id, string Title, string Stage, string Folder, string Complexity, List<string> Readable);

public record ProblemList(List<StageEntry> Stages, List<ProblemEntry> Problems);

public record Statement(string Difficulty, string Link, string Body);
