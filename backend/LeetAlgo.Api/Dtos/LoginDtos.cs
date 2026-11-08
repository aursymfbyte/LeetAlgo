namespace LeetAlgo.Api.Dtos;

public record LoginRequest(string UserName, string Password);

public record LoginResponse(string Token);
