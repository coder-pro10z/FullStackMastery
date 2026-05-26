using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Npgsql.EntityFrameworkCore.PostgreSQL;

namespace InterviewPrepApp.Infrastructure.Persistence;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var provider = Environment.GetEnvironmentVariable("DatabaseProvider");

        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        
        if (string.Equals(provider, "Postgres", StringComparison.OrdinalIgnoreCase))
        {
            var postgresConnection =
                Environment.GetEnvironmentVariable("POSTGRES_CONNECTION");

            optionsBuilder.UseNpgsql(postgresConnection);
        }
        else
        {
            var sqlServerConnection =
                Environment.GetEnvironmentVariable("SQLSERVER_CONNECTION")
                ?? "Server=host.docker.internal,1433;Database=InterviewPrepAppDb;TrustServerCertificate=True;";

            optionsBuilder.UseSqlServer(sqlServerConnection);
        }

        return new ApplicationDbContext(optionsBuilder.Options);
    }
}
