# //cd src
# //copy all
# //download dependencies
# //build the app using .net build 
# //run the app using the .net run command
# // 
# // Use the official .NET SDK image as the base image


FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Set the working directory in the container
WORKDIR /src

# Copy the project file and restore dependencies
COPY . .
RUN dotnet restore "InterviewPrepApp.Api/InterviewPrepApp.Api.csproj"

# Build the application
RUN dotnet publish "InterviewPrepApp.Api/InterviewPrepApp.Api.csproj" -c Release -o /app/publish

# Use the official .NET runtime image as the base image for the final stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copy the built application from the publish stage
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
# Expose the port the application will run on
EXPOSE 8080

# Set the entry point to run the application
ENTRYPOINT ["dotnet", "InterviewPrepApp.Api.dll"]