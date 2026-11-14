using LeetAlgo.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace LeetAlgo.Data;

public class LeetAlgoContext(DbContextOptions<LeetAlgoContext> options) : DbContext(options)
{
    public DbSet<Stage> Stages => Set<Stage>();
    public DbSet<Problem> Problems => Set<Problem>();
    public DbSet<Solution> Solutions => Set<Solution>();
    public DbSet<Comparison> Comparisons => Set<Comparison>();
    public DbSet<Admin> Admins => Set<Admin>();
    public DbSet<Visit> Visits => Set<Visit>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Stage>(table =>
        {
            table.Property(stage => stage.Code).HasMaxLength(20);
            table.Property(stage => stage.Name).HasMaxLength(50);
            table.HasIndex(stage => stage.Code).IsUnique();
        });

        modelBuilder.Entity<Problem>(table =>
        {
            table.Property(problem => problem.Id).ValueGeneratedNever();
            table.Property(problem => problem.Title).HasMaxLength(200);
            table.Property(problem => problem.Difficulty).HasMaxLength(10);
            table.Property(problem => problem.Link).HasMaxLength(300);
            table.Property(problem => problem.Complexity).HasMaxLength(300);
        });

        modelBuilder.Entity<Solution>(table =>
        {
            table.Property(solution => solution.Language).HasMaxLength(10);
            table.Property(solution => solution.Version).HasMaxLength(10);
            table.HasIndex(solution => new { solution.ProblemId, solution.Language, solution.Version }).IsUnique();
        });

        modelBuilder.Entity<Comparison>(table =>
        {
            table.HasKey(comparison => comparison.ProblemId);
            table.Property(comparison => comparison.ReadableComplexity).HasMaxLength(300);
            table.Property(comparison => comparison.OptimalComplexity).HasMaxLength(300);
        });

        modelBuilder.Entity<Admin>(table =>
        {
            table.Property(admin => admin.UserName).HasMaxLength(50);
            table.HasIndex(admin => admin.UserName).IsUnique();
        });

        modelBuilder.Entity<Visit>(table =>
        {
            table.HasIndex(visit => new { visit.Date, visit.VisitorId }).IsUnique();
        });
    }
}
