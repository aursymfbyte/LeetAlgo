using System.Security.Claims;
using LeetAlgo.Data.Models;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace LeetAlgo.Api.Auth;

public class TokenService(JwtSettings settings)
{
    public string CreateToken(Admin admin)
    {
        SecurityTokenDescriptor descriptor = new()
        {
            Issuer = settings.Issuer,
            Audience = settings.Audience,
            Subject = new ClaimsIdentity([new Claim(ClaimTypes.Name, admin.UserName)]),
            Expires = DateTime.UtcNow.AddHours(settings.ExpireHours),
            SigningCredentials = new SigningCredentials(settings.SigningKey(), SecurityAlgorithms.HmacSha256),
        };

        return new JsonWebTokenHandler().CreateToken(descriptor);
    }
}
