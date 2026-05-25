using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Npgsql.EntityFrameworkCore.PostgreSQL;

namespace InterviewPrepApp.Infrastructure.Persistence;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    private const string ConnectionString =
        "Server=DESKTOP-48C94E6\\SQLEXPRESS;Database=InterviewPrepAppDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;";

    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var provider =
            Environment.GetEnvironmentVariable("DatabaseProvider");
        

        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        
        if (provider == "Postgres")
        {
            var postgresConnection =
                Environment.GetEnvironmentVariable("POSTGRES_CONNECTION");

            optionsBuilder.UseNpgsql(postgresConnection);
        }
        else
        {
            optionsBuilder.UseSqlServer(ConnectionString);
        }

        return new ApplicationDbContext(optionsBuilder.Options);
    }
}
