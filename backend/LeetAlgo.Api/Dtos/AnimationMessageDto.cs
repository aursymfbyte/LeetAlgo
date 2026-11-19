using System.ComponentModel.DataAnnotations;

namespace LeetAlgo.Api.Dtos;

public record AnimationMessageDto(
    [MaxLength(10, ErrorMessage = "動畫版本最多 10 個字。")] string Version,
    int Step,
    [MaxLength(300, ErrorMessage = "動畫說明最多 300 個字。")] string Text,
    byte[]? Revision = null);
