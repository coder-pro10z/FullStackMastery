# Stage 1: Build the API
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy solution and project files first to restore dependencies
COPY backend/InterviewPrepApp.sln ./backend/
COPY backend/src/InterviewPrepApp.Domain/InterviewPrepApp.Domain.csproj ./backend/src/InterviewPrepApp.Domain/
COPY backend/src/InterviewPrepApp.Application/InterviewPrepApp.Application.csproj ./backend/src/InterviewPrepApp.Application/
COPY backend/src/InterviewPrepApp.Infrastructure/InterviewPrepApp.Infrastructure.csproj ./backend/src/InterviewPrepApp.Infrastructure/
COPY backend/src/InterviewPrepApp.Api/InterviewPrepApp.Api.csproj ./backend/src/InterviewPrepApp.Api/

RUN dotnet restore ./backend/InterviewPrepApp.sln

# Copy the rest of the source code
COPY backend/ ./backend/

# Publish the API project in Release mode
WORKDIR /app/backend
RUN dotnet publish src/InterviewPrepApp.Api/InterviewPrepApp.Api.csproj -c Release -o /app/out --no-restore

# Stage 2: Runtime Environment
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .

# Render dynamically assigns PORT, but defaults to 8080 inside the container.
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "InterviewPrepApp.Api.dll"]
