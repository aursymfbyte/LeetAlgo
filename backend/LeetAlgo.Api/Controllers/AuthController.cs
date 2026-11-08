using LeetAlgo.Api.Auth;
using LeetAlgo.Api.Dtos;
using LeetAlgo.Data;
using LeetAlgo.Data.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace LeetAlgo.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(LeetAlgoContext context, TokenService tokenService) : ControllerBase
{
    [HttpPost("login")]
    [EnableRateLimiting("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        Admin? admin = await context.Admins.FirstOrDefaultAsync(item => item.UserName == request.UserName);
        if (admin == null)
        {
            return Unauthorized();
        }

        PasswordHasher<Admin> hasher = new();
        PasswordVerificationResult result = hasher.VerifyHashedPassword(admin, admin.PasswordHash, request.Password);
        if (result == PasswordVerificationResult.Failed)
        {
            return Unauthorized();
        }

        return new LoginResponse(tokenService.CreateToken(admin));
    }
}
