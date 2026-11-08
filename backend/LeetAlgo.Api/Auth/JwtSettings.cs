using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace LeetAlgo.Api.Auth;

public class JwtSettings
{
    public string Issuer { get; set; } = "";
    public string Audience { get; set; } = "";
    public string Key { get; set; } = "";
    public int ExpireHours { get; set; }

    public SymmetricSecurityKey SigningKey()
    {
        return new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Key));
    }
}
