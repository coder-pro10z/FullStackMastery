# Local SQL Server → Supabase (Postgres) migration guide (EF Core / .NET 8)

This repo supports both SQL Server and Postgres via `DatabaseProvider`. This guide documents a clean “switch providers” flow and how to regenerate EF Core migrations for Supabase.

## 0) Preconditions

- You have a Supabase project (Postgres) created.
- You have the Supabase connection string (prefer the **pooler** host if you’re using serverless/edge).
- EF Core tools installed: `dotnet tool install --global dotnet-ef`

## 1) Add / configure connection strings (safe local dev)

Avoid committing Supabase passwords to git.

### Option A (recommended): User secrets for local dev

From the API project folder:

```powershell
cd backend/src/InterviewPrepApp.Api
dotnet user-secrets init
dotnet user-secrets set "DatabaseProvider" "Postgres"
dotnet user-secrets set "ConnectionStrings:PostgresConnection" "Host=...;Port=5432;Database=postgres;Username=postgres.<project-ref>;Password=...;SSL Mode=Require;Trust Server Certificate=true"
```

### Option B: Environment variables (also works for migrations)

```powershell
$env:DatabaseProvider="Postgres"
$env:POSTGRES_CONNECTION="Host=...;Port=5432;Database=postgres;Username=postgres.<project-ref>;Password=...;SSL Mode=Require;Trust Server Certificate=true"
```

Notes:
- `POSTGRES_CONNECTION` is used by the design-time factory for `dotnet ef ...` commands.
- `ConnectionStrings:PostgresConnection` is used by the running API (via `appsettings.*` + user secrets/env overrides).

## 2) Program.cs: ensure the provider switch + auto-migrate is wired

This repo already contains the provider switch in `backend/src/InterviewPrepApp.Api/Program.cs` and it applies migrations at startup:

- Set `DatabaseProvider` to `Postgres` to use `UseNpgsql(...)`.
- Startup runs `await dbContext.Database.MigrateAsync();`

If you *don’t* want auto-migrations for production, comment out the migrate call and instead run migrations as a deploy step (see section 6).

## 3) Verify the API connects to Supabase

Run the API and confirm it starts without DB errors:

```powershell
dotnet run --project backend/src/InterviewPrepApp.Api/InterviewPrepApp.Api.csproj
```

If you see connection failures:
- Confirm Supabase IP/network settings (if any).
- Confirm you’re using the right host (pooler vs direct), port, and SSL settings.

## 4) IMPORTANT: EF migrations are provider-specific

EF Core scaffolds migrations for the *active provider*. SQL Server migrations are not guaranteed to work on Postgres.

Microsoft docs (“Migrations with Multiple Providers”) explains the provider-specific nature and recommends separate migration sets.

For a clean “SQL Server → Postgres” switch, regenerate migrations for Postgres.

## 5) Remove SQL Server migrations, re-create migrations for Postgres

### Step 5.1: Delete old migrations (clean slate)

Delete the existing migrations folder:

- `backend/src/InterviewPrepApp.Infrastructure/Migrations`

Keep your entity classes and `ApplicationDbContext` unchanged.

### Step 5.2: Create a new initial migration for Postgres

Set env vars so the design-time factory uses Npgsql:

```powershell
$env:DatabaseProvider="Postgres"
$env:POSTGRES_CONNECTION="Host=...;Port=5432;Database=postgres;Username=postgres.<project-ref>;Password=...;SSL Mode=Require;Trust Server Certificate=true"
```

Then scaffold migrations into the Infrastructure project:

```powershell
dotnet ef migrations add InitialCreate_Postgres `
  --project backend/src/InterviewPrepApp.Infrastructure/InterviewPrepApp.Infrastructure.csproj `
  --startup-project backend/src/InterviewPrepApp.Api/InterviewPrepApp.Api.csproj `
  --context ApplicationDbContext `
  --output-dir Migrations
```

### Step 5.3: Apply migrations to Supabase

```powershell
dotnet ef database update `
  --project backend/src/InterviewPrepApp.Infrastructure/InterviewPrepApp.Infrastructure.csproj `
  --startup-project backend/src/InterviewPrepApp.Api/InterviewPrepApp.Api.csproj `
  --context ApplicationDbContext
```

At this point your Supabase DB should have:
- EF migrations history table (`__EFMigrationsHistory`)
- Identity tables (ASP.NET Core Identity)
- Your domain tables (Categories, Questions, etc.)
- Your `HasData(...)` seed data applied

## 6) Production-friendly migration workflow (recommended)

Instead of auto-running migrations at API startup in production, generate a SQL script and apply it during deployment:

```powershell
dotnet ef migrations script `
  --project backend/src/InterviewPrepApp.Infrastructure/InterviewPrepApp.Infrastructure.csproj `
  --startup-project backend/src/InterviewPrepApp.Api/InterviewPrepApp.Api.csproj `
  --context ApplicationDbContext `
  --idempotent `
  --output backend/migrations.postgres.sql
```

Then run that script against Supabase (via psql or Supabase SQL Editor).

## 7) Common SQL Server → Postgres “gotchas”

- **Identifiers/casing**: Postgres folds unquoted identifiers to lowercase; EF/Npgsql handles this, but raw SQL may need adjustments.
- **Date/time types**: Prefer `timestamp with time zone` semantics (Npgsql maps `DateTime`/`DateTimeOffset` differently than SQL Server).
- **GUIDs**: Postgres uses `uuid`; Npgsql maps `Guid` cleanly.
- **Indexes/unique constraints**: Ensure any filtered indexes or SQL Server-specific constructs aren’t assumed.

## 8) Rollback strategy (if you need to go back to SQL Server)

- Set `DatabaseProvider` back to `SqlServer`.
- Regenerate migrations for SQL Server into a separate directory (recommended) instead of reusing the Postgres ones:
  - Example: `--output-dir Migrations.SqlServer`

This keeps provider-specific migration histories separate and avoids accidentally applying the wrong provider’s DDL.
