using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace InterviewPrepApp.Infrastructure.Persistence;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    private const string ConnectionString =
        "Server=DESKTOP-48C94E6\\SQLEXPRESS;Database=InterviewPrepAppDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;";

    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseSqlServer(ConnectionString);

        return new ApplicationDbContext(optionsBuilder.Options);
    }
}
