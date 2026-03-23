using InterviewPrepApp.Application.Interfaces;
using InterviewPrepApp.Api.Infrastructure;
using InterviewPrepApp.Domain.Entities;
using InterviewPrepApp.Infrastructure.Persistence;
using InterviewPrepApp.Infrastructure.Services;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Text.Json.Serialization;

namespace InterviewPrepApp.Api
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                });
            builder.Services.AddProblemDetails();
            builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "Interview Prep API", Version = "v1" });

                // Configure Swagger to use JWT
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer"
                });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });

            // Database Context
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // Identity
            builder.Services.AddIdentityCore<ApplicationUser>()
                .AddRoles<IdentityRole>()
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddDefaultTokenProviders();

            // JWT Authentication
            var jwtSettings = builder.Configuration.GetSection("Jwt");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false;
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = jwtSettings["Issuer"],
                    ValidateAudience = true,
                    ValidAudience = jwtSettings["Audience"],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };
            });

            // CORS for Angular — allows any localhost origin (any port) so ng serve on any port works.
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("Angular", policy =>
                {
                    policy.SetIsOriginAllowed(origin =>
                          {
                              // Allow all localhost origins (any port) for development
                              var uri = new Uri(origin);
                              return uri.Host == "localhost" || uri.Host == "127.0.0.1";
                          })
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });
            });

            // Register application services
            builder.Services.AddScoped<IExcelExtractor, ExcelExtractionService>();
            builder.Services.AddScoped<ICategoryService, CategoryService>();
            builder.Services.AddScoped<IQuestionService, QuestionService>();
            builder.Services.AddScoped<IUserProgressService, UserProgressService>();

            // Admin services
            builder.Services.AddScoped<InterviewPrepApp.Application.Interfaces.IAuditLogService, InterviewPrepApp.Infrastructure.Services.AuditLogService>();
            builder.Services.AddScoped<InterviewPrepApp.Application.Interfaces.IAdminQuestionService, InterviewPrepApp.Infrastructure.Services.AdminQuestionService>();
            builder.Services.AddScoped<InterviewPrepApp.Application.Interfaces.IAdminDashboardService, InterviewPrepApp.Infrastructure.Services.AdminDashboardService>();
            builder.Services.AddScoped<InterviewPrepApp.Application.Interfaces.IAdminCategoryService, InterviewPrepApp.Infrastructure.Services.AdminCategoryService>();
            builder.Services.AddScoped<InterviewPrepApp.Application.Interfaces.IQuizService, InterviewPrepApp.Infrastructure.Services.QuizService>();
            builder.Services.AddScoped<InterviewPrepApp.Application.Interfaces.ICheatSheetService, InterviewPrepApp.Infrastructure.Services.CheatSheetService>();

            // RBAC policies
            builder.Services.AddAuthorization(options =>
            {
                options.AddPolicy("AdminOnly", p => p.RequireRole("Admin"));
                options.AddPolicy("AdminOrEditor", p => p.RequireRole("Admin", "Editor"));
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Interview Prep API V1");
                });
            }

            app.UseExceptionHandler();
            app.UseHttpsRedirection();
            app.UseCors("Angular");
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();

            // Create admin role and default admin user on startup
            using (var scope = app.Services.CreateScope())
            {
                var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

                // Create Admin role if it doesn't exist
                if (!await roleManager.RoleExistsAsync("Admin"))
                {
                    await roleManager.CreateAsync(new IdentityRole("Admin"));
                    Console.WriteLine("Admin role created successfully.");
                }

                // Optional: Create a default admin user (you can remove this in production)
                var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
                var adminEmail = "admin@interviewprep.com";
                var adminUser = await userManager.FindByEmailAsync(adminEmail);

                if (adminUser == null)
                {
                    adminUser = new ApplicationUser
                    {
                        UserName = adminEmail,
                        Email = adminEmail,
                        EmailConfirmed = true
                    };

                    var result = await userManager.CreateAsync(adminUser, "Admin@123");
                    if (result.Succeeded)
                    {
                        await userManager.AddToRoleAsync(adminUser, "Admin");
                        Console.WriteLine("Default admin user created. Email: admin@interviewprep.com, Password: Admin@123");
                    }
                }
            }

            // Ensure database is created and migrations are applied
            using (var scope = app.Services.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                await dbContext.Database.MigrateAsync();
            }

            await app.RunAsync();
        }
    }
}
