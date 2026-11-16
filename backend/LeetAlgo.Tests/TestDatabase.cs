using LeetAlgo.Data;
using Microsoft.EntityFrameworkCore;

namespace LeetAlgo.Tests;

public static class TestDatabase
{
    public static LeetAlgoContext CreateContext()
    {
        DbContextOptions<LeetAlgoContext> options = new DbContextOptionsBuilder<LeetAlgoContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new LeetAlgoContext(options);
    }
}
