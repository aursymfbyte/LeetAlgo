using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace LeetAlgo.Api.Dtos;

public record ProblemEditDto(
    int Id,
    [Required(ErrorMessage = "請填寫題名。")]
    [MaxLength(200, ErrorMessage = "題名最多 200 個字。")]
    [WindowsFolderName]
    string Title,
    [MaxLength(20, ErrorMessage = "階段代號最多 20 個字。")] string Stage,
    [MaxLength(10, ErrorMessage = "難度最多 10 個字。")] string Difficulty,
    [MaxLength(300, ErrorMessage = "連結最多 300 個字。")] string Link,
    string Statement,
    [MaxLength(300, ErrorMessage = "題目列表的複雜度最多 300 個字。")] string Complexity,
    string ComplexityAnalysis,
    Dictionary<string, string> Optimal,
    Dictionary<string, string> Readable,
    ComparisonEditDto? Comparison,
    Guid? Revision = null);

public record ComparisonEditDto(
    [MaxLength(300, ErrorMessage = "可讀性版的複雜度最多 300 個字。")] string ReadableComplexity,
    [MaxLength(300, ErrorMessage = "效能版的複雜度最多 300 個字。")] string OptimalComplexity);

internal sealed class WindowsFolderNameAttribute() : ValidationAttribute(
    """題名不能含有 < > : " / \ | ? * 或控制字元，不能用 Windows 保留名稱，也不能以空格或半形句點結尾。""")
{
    public override bool IsValid(object? value)
    {
        if (value is not string title || title.Length == 0)
        {
            return true;
        }
        if (title.EndsWith(' ') || title.EndsWith('.'))
        {
            return false;
        }
        if (title.IndexOfAny(['<', '>', ':', '"', '/', '\\', '|', '?', '*']) >= 0 || title.Any(c => c < ' '))
        {
            return false;
        }
        string stem = title.Split('.', 2)[0].TrimEnd(' ').ToUpperInvariant();
        return !Regex.IsMatch(stem, @"\A(CON|PRN|AUX|NUL|CONIN\$|CONOUT\$|COM[1-9¹²³]|LPT[1-9¹²³])\z");
    }
}
