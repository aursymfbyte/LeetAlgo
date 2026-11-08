using LeetAlgo.Data;
using LeetAlgo.Data.Models;
using Microsoft.AspNetCore.Identity;

namespace LeetAlgo.Tools;

public static class AdminCreator
{
    public static void Create(LeetAlgoContext context, string userName, string password)
    {
        Admin admin = new() { UserName = userName };
        admin.PasswordHash = new PasswordHasher<Admin>().HashPassword(admin, password);

        context.Admins.Add(admin);
        context.SaveChanges();
    }
}
