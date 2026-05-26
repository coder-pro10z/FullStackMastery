using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace InterviewPrepApp.Infrastructure.Persistence;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var configuration = BuildConfiguration();

        var providerRaw =
            Environment.GetEnvironmentVariable("DatabaseProvider")
            ?? configuration["DatabaseProvider"];

        var provider = string.IsNullOrWhiteSpace(providerRaw) ? "SqlServer" : providerRaw.Trim();

        var postgresConnection =
            Environment.GetEnvironmentVariable("POSTGRES_CONNECTION")
            ?? Environment.GetEnvironmentVariable("PostgresConnection")
            ?? configuration.GetConnectionString("PostgresConnection");

        var sqlServerConnection =
            Environment.GetEnvironmentVariable("SQLSERVER_CONNECTION")
            ?? configuration.GetConnectionString("SqlServerDocker")
            ?? "Server=host.docker.internal,1433;Database=InterviewPrepAppDb;TrustServerCertificate=True;";

        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();

        if (provider.Equals("Postgres", StringComparison.OrdinalIgnoreCase))
        {
            optionsBuilder.UseNpgsql(postgresConnection);
        }
        else
        {
            optionsBuilder.UseSqlServer(sqlServerConnection);
        }

        return new ApplicationDbContext(optionsBuilder.Options);
    }

    private static IConfigurationRoot BuildConfiguration()
    {
        var cwd = Directory.GetCurrentDirectory();

        var candidateBasePaths = new[]
        {
            cwd,
            Path.Combine(cwd, "InterviewPrepApp.Api"),
            Path.Combine(cwd, "backend", "src", "InterviewPrepApp.Api"),
        };

        var basePath = candidateBasePaths.FirstOrDefault(p => File.Exists(Path.Combine(p, "appsettings.json"))) ?? cwd;

        return new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: true, reloadOnChange: false)
            .AddJsonFile("appsettings.Development.json", optional: true, reloadOnChange: false)
            .AddEnvironmentVariables()
            .Build();
    }
}
