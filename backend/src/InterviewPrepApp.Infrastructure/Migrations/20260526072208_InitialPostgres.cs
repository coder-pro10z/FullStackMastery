using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace InterviewPrepApp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialPostgres : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    UserName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: true),
                    SecurityStamp = table.Column<string>(type: "text", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "text", nullable: true),
                    PhoneNumber = table.Column<string>(type: "text", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    UserEmail = table.Column<string>(type: "text", nullable: false),
                    Action = table.Column<string>(type: "text", nullable: false),
                    EntityType = table.Column<string>(type: "text", nullable: false),
                    EntityId = table.Column<string>(type: "text", nullable: true),
                    OldValues = table.Column<string>(type: "text", nullable: true),
                    NewValues = table.Column<string>(type: "text", nullable: true),
                    IpAddress = table.Column<string>(type: "text", nullable: true),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Slug = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    ParentId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Categories_Categories_ParentId",
                        column: x => x.ParentId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DevHexagons",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Version = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Role = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    TargetLevel = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DevHexagons", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ImportJobs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    FileName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    FileSizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    TempFilePath = table.Column<string>(type: "text", nullable: false),
                    UploadedByUserId = table.Column<string>(type: "text", nullable: false),
                    UploadedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    StartedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TotalRows = table.Column<int>(type: "integer", nullable: false),
                    ProcessedRows = table.Column<int>(type: "integer", nullable: false),
                    FailedRows = table.Column<int>(type: "integer", nullable: false),
                    ErrorSummaryJson = table.Column<string>(type: "text", nullable: true),
                    RetryPayloadJson = table.Column<string>(type: "text", nullable: true),
                    LastProcessedBatch = table.Column<int>(type: "integer", nullable: false),
                    DefaultCategoryId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ImportJobs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RoleId = table.Column<string>(type: "text", nullable: false),
                    ClaimType = table.Column<string>(type: "text", nullable: true),
                    ClaimValue = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    ClaimType = table.Column<string>(type: "text", nullable: true),
                    ClaimValue = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "text", nullable: false),
                    ProviderKey = table.Column<string>(type: "text", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "text", nullable: true),
                    UserId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "text", nullable: false),
                    RoleId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "text", nullable: false),
                    LoginProvider = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Value = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuizAttempts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    Mode = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExpiresAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TotalQuestions = table.Column<int>(type: "integer", nullable: false),
                    CorrectCount = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizAttempts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuizAttempts_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CheatSheetResources",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Url = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    MarkdownContent = table.Column<string>(type: "text", nullable: true),
                    CategoryId = table.Column<int>(type: "integer", nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CheatSheetResources", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CheatSheetResources_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Questions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: true),
                    QuestionText = table.Column<string>(type: "text", nullable: false),
                    AnswerText = table.Column<string>(type: "text", nullable: true),
                    Difficulty = table.Column<int>(type: "integer", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: false),
                    CategoryId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedByUserId = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Questions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Questions_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuizQuestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ExternalId = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    QuestionText = table.Column<string>(type: "text", nullable: false),
                    OptionA = table.Column<string>(type: "text", nullable: false),
                    OptionB = table.Column<string>(type: "text", nullable: false),
                    OptionC = table.Column<string>(type: "text", nullable: false),
                    OptionD = table.Column<string>(type: "text", nullable: false),
                    CorrectAnswer = table.Column<string>(type: "character varying(1)", maxLength: 1, nullable: false),
                    Explanation = table.Column<string>(type: "text", nullable: true),
                    Role = table.Column<string>(type: "text", nullable: true),
                    Tags = table.Column<string>(type: "text", nullable: true),
                    Difficulty = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CategoryId = table.Column<int>(type: "integer", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuizQuestions_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "StudyGuideSections",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ExternalId = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Title = table.Column<string>(type: "character varying(400)", maxLength: 400, nullable: false),
                    ContentMarkdown = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: true),
                    Tags = table.Column<string>(type: "text", nullable: true),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    CategoryId = table.Column<int>(type: "integer", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudyGuideSections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudyGuideSections_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "PrimaryMetrics",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Value = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    DevHexagonId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrimaryMetrics", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PrimaryMetrics_DevHexagons_DevHexagonId",
                        column: x => x.DevHexagonId,
                        principalTable: "DevHexagons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SkillCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    HighLevelGoal = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    InterviewGotcha = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    DevHexagonId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SkillCategories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SkillCategories_DevHexagons_DevHexagonId",
                        column: x => x.DevHexagonId,
                        principalTable: "DevHexagons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuestionVersions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    QuestionId = table.Column<int>(type: "integer", nullable: false),
                    VersionNumber = table.Column<int>(type: "integer", nullable: false),
                    QuestionSnapshot = table.Column<string>(type: "text", nullable: false),
                    AnswerSnapshot = table.Column<string>(type: "text", nullable: true),
                    EditedByUserId = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionVersions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuestionVersions_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserProgresses",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "text", nullable: false),
                    QuestionId = table.Column<int>(type: "integer", nullable: false),
                    IsSolved = table.Column<bool>(type: "boolean", nullable: false),
                    IsRevision = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserProgresses", x => new { x.UserId, x.QuestionId });
                    table.ForeignKey(
                        name: "FK_UserProgresses_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserProgresses_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuizAttemptQuestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    QuizAttemptId = table.Column<int>(type: "integer", nullable: false),
                    QuizQuestionId = table.Column<int>(type: "integer", nullable: false),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false),
                    QuestionTextSnapshot = table.Column<string>(type: "text", nullable: false),
                    OptionASnapshot = table.Column<string>(type: "text", nullable: false),
                    OptionBSnapshot = table.Column<string>(type: "text", nullable: false),
                    OptionCSnapshot = table.Column<string>(type: "text", nullable: false),
                    OptionDSnapshot = table.Column<string>(type: "text", nullable: false),
                    ExplanationSnapshot = table.Column<string>(type: "text", nullable: false),
                    CorrectAnswerSnapshot = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizAttemptQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuizAttemptQuestions_QuizAttempts_QuizAttemptId",
                        column: x => x.QuizAttemptId,
                        principalTable: "QuizAttempts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_QuizAttemptQuestions_QuizQuestions_QuizQuestionId",
                        column: x => x.QuizQuestionId,
                        principalTable: "QuizQuestions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Skills",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TopicName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    SkillCategoryId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Skills", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Skills_SkillCategories_SkillCategoryId",
                        column: x => x.SkillCategoryId,
                        principalTable: "SkillCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuizAttemptResponses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    QuizAttemptQuestionId = table.Column<int>(type: "integer", nullable: false),
                    SelectedAnswer = table.Column<string>(type: "text", nullable: true),
                    IsCorrect = table.Column<bool>(type: "boolean", nullable: true),
                    AnsweredAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizAttemptResponses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuizAttemptResponses_QuizAttemptQuestions_QuizAttemptQuesti~",
                        column: x => x.QuizAttemptQuestionId,
                        principalTable: "QuizAttemptQuestions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Name", "ParentId", "Slug" },
                values: new object[,]
                {
                    { 1, "Fundamentals", null, "fundamentals" },
                    { 15, "Backend", null, "backend" },
                    { 58, ".NET", null, "dotnet" },
                    { 61, "Angular", null, "angular" },
                    { 64, "System Design", null, "system-design" }
                });

            migrationBuilder.InsertData(
                table: "DevHexagons",
                columns: new[] { "Id", "Role", "TargetLevel", "Version" },
                values: new object[] { 1, ".NET Full Stack Engineer", "Intermediate/Senior", "2026.2" });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Name", "ParentId", "Slug" },
                values: new object[,]
                {
                    { 2, "OOPS", 1, "oops" },
                    { 9, "SOLID", 1, "solid" },
                    { 16, "Middleware", 15, "middleware" },
                    { 20, "Caching", 15, "caching" },
                    { 27, "API Design", 15, "api-design" },
                    { 37, "Database", 15, "database" },
                    { 47, "Security", 15, "security" },
                    { 59, "ASP.NET Core", 58, "aspnet-core" },
                    { 60, "Entity Framework Core", 58, "ef-core" },
                    { 62, "Components", 61, "components" },
                    { 63, "RxJS", 61, "rxjs" },
                    { 65, "High-Level Design", 64, "hld" },
                    { 66, "Low-Level Design", 64, "lld" },
                    { 67, "Scalability", 64, "scalability" }
                });

            migrationBuilder.InsertData(
                table: "PrimaryMetrics",
                columns: new[] { "Id", "DevHexagonId", "Value" },
                values: new object[,]
                {
                    { 1, 1, "Sub-50ms latency" },
                    { 2, 1, "500+ concurrent users" }
                });

            migrationBuilder.InsertData(
                table: "SkillCategories",
                columns: new[] { "Id", "Category", "DevHexagonId", "HighLevelGoal", "InterviewGotcha" },
                values: new object[,]
                {
                    { 1, "Backend (.NET)", 1, "Reliability & Performance", "How do you handle a failing 3rd party API?" },
                    { 2, "Frontend (Angular)", 1, "User Experience & State Management", "How do you optimize a page with 1,000+ data rows?" },
                    { 3, "DBMS (SQL Server & EF Core)", 1, "Data Integrity & Query Optimization", "Explain your strategy for database migrations in production." },
                    { 4, "DevOps (Azure)", 1, "Automation & CI/CD", "How do you ensure zero-downtime deployments?" },
                    { 5, "System Design & Architecture", 1, "Scalability & Resilience", "How would you handle a 10x spike in traffic?" },
                    { 6, "Testing & Observability", 1, "Maintainability & Fast Debugging", "How do you identify a memory leak in a production environment?" }
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Name", "ParentId", "Slug" },
                values: new object[,]
                {
                    { 3, "Abstraction", 2, "abstraction" },
                    { 6, "Encapsulation", 2, "encapsulation" },
                    { 7, "Inheritance", 2, "inheritance" },
                    { 8, "Polymorphism", 2, "polymorphism" },
                    { 10, "Single Responsibility", 9, "srp" },
                    { 11, "Open-Closed", 9, "ocp" },
                    { 12, "Liskov Substitution", 9, "lsp" },
                    { 13, "Interface Segregation", 9, "isp" },
                    { 14, "Dependency Inversion", 9, "dip" },
                    { 17, "Request Pipeline", 16, "request-pipeline" },
                    { 18, "Error Handling", 16, "error-handling" },
                    { 19, "Logging", 16, "logging" },
                    { 21, "HTTP Caching", 20, "http-caching" },
                    { 22, "Cache Headers", 20, "cache-headers" },
                    { 26, "CDN", 20, "cdn" },
                    { 28, "REST", 27, "rest" },
                    { 32, "GraphQL", 27, "graphql" },
                    { 36, "gRPC", 27, "grpc" },
                    { 38, "SQL", 37, "sql" },
                    { 41, "NoSQL", 37, "nosql" },
                    { 44, "ORM", 37, "orm" },
                    { 48, "Authentication", 47, "authentication" },
                    { 52, "Authorization", 47, "authorization" },
                    { 56, "Encryption", 47, "encryption" },
                    { 57, "CORS", 47, "cors" }
                });

            migrationBuilder.InsertData(
                table: "Skills",
                columns: new[] { "Id", "SkillCategoryId", "TopicName" },
                values: new object[,]
                {
                    { 1, 1, "Concurrency (async/await, Task, Thread Pool)" },
                    { 2, 1, "Garbage Collection (Gen 0/1/2, LOH, IDisposable)" },
                    { 3, 1, "Dependency Injection (Lifetimes, Scopes)" },
                    { 4, 1, "Middleware & Request Pipeline" },
                    { 5, 1, "Minimal APIs vs. Controllers" },
                    { 6, 1, "Performance Profiling (BenchmarkDotNet, dotTrace)" },
                    { 7, 1, "Caching Strategies (MemoryCache, Distributed Cache)" },
                    { 8, 1, "Background Services (IHostedService)" },
                    { 9, 1, "Exception Handling & Resiliency (Polly)" },
                    { 10, 1, "Clean Architecture" },
                    { 11, 2, "RxJS & Reactive Programming (Observables, Subjects)" },
                    { 12, 2, "Signal-Based State Management" },
                    { 13, 2, "Component Lifecycle & Change Detection (OnPush)" },
                    { 14, 2, "Lazy Loading & Route Guards" },
                    { 15, 2, "Interceptors (Auth, Error Handling)" },
                    { 16, 2, "State Management Libraries (NgRx)" },
                    { 17, 2, "Performance Optimization (Bundle Size reduction)" },
                    { 18, 2, "Custom Directives & Pipes" },
                    { 19, 2, "SSR (Server-Side Rendering) & Hydration" },
                    { 20, 2, "WebSockets & SignalR Integration" },
                    { 21, 3, "Query Execution Plans & Optimization" },
                    { 22, 3, "Indexing Strategies (Clustered vs. Non-Clustered)" },
                    { 23, 3, "N+1 Problem & Eager/Lazy Loading" },
                    { 24, 3, "Dapper for High-Performance Read Paths" },
                    { 25, 3, "Database Migrations & CI/CD Versioning" },
                    { 26, 3, "Transactions & Isolation Levels (Deadlocks)" },
                    { 27, 3, "Connection Pooling" },
                    { 28, 3, "Stored Procedures vs. ORM" },
                    { 29, 3, "Data Modeling & Normalization" },
                    { 30, 3, "Partitioning & Archiving Strategies" },
                    { 31, 4, "CI/CD Pipelines (YAML in Azure DevOps/GitHub Actions)" },
                    { 32, 4, "Infrastructure as Code (Bicep/Terraform)" },
                    { 33, 4, "Docker Containerization" },
                    { 34, 4, "Azure App Services & Serverless (Functions)" },
                    { 35, 4, "Secrets Management (Azure Key Vault)" },
                    { 36, 4, "Blue/Green & Canary Deployments" },
                    { 37, 4, "Role-Based Access Control (RBAC) & Managed Identities" },
                    { 38, 4, "Load Balancing & Traffic Manager" },
                    { 39, 4, "Container Orchestration (Azure Container Apps)" },
                    { 40, 4, "API Management (APIM)" },
                    { 41, 5, "Domain-Driven Design (DDD - Entities, Aggregates)" },
                    { 42, 5, "Microservices vs. Modular Monolith" },
                    { 43, 5, "CQRS (Command Query Responsibility Segregation)" },
                    { 44, 5, "Event-Driven Architecture (Pub/Sub)" },
                    { 45, 5, "Message Brokers (Azure Service Bus, RabbitMQ)" },
                    { 46, 5, "API Gateway Pattern" },
                    { 47, 5, "Distributed Caching (Redis)" },
                    { 48, 5, "Rate Limiting & Throttling" },
                    { 49, 5, "SAGA Pattern & Distributed Transactions" },
                    { 50, 5, "CAP Theorem & Database Selection" },
                    { 51, 6, "Test-Driven Development (TDD: Red-Green-Refactor)" },
                    { 52, 6, "Unit Testing (xUnit)" },
                    { 53, 6, "Mocking Frameworks (Moq, NSubstitute)" },
                    { 54, 6, "Integration Testing (WebApplicationFactory, Testcontainers)" },
                    { 55, 6, "Structured Logging (Serilog)" },
                    { 56, 6, "Distributed Tracing (OpenTelemetry)" },
                    { 57, 6, "Metrics & Dashboards (Application Insights/Grafana)" },
                    { 58, 6, "Application Health Checks" },
                    { 59, 6, "Alerting & Incident Response" },
                    { 60, 6, "Load Testing (k6, JMeter)" }
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Name", "ParentId", "Slug" },
                values: new object[,]
                {
                    { 4, "Abstract Classes", 3, "abstract-classes" },
                    { 5, "Interfaces", 3, "interfaces" },
                    { 23, "Cache-Control", 22, "cache-control" },
                    { 24, "Expires", 22, "expires" },
                    { 25, "ETag", 22, "etag" },
                    { 29, "HTTP Methods", 28, "http-methods" },
                    { 30, "Status Codes", 28, "status-codes" },
                    { 31, "Resource Design", 28, "resource-design" },
                    { 33, "Queries", 32, "queries" },
                    { 34, "Mutations", 32, "mutations" },
                    { 35, "Subscriptions", 32, "subscriptions" },
                    { 39, "Indexes", 38, "indexes" },
                    { 40, "Transactions", 38, "transactions" },
                    { 42, "Document DB", 41, "document-db" },
                    { 43, "Key-Value", 41, "key-value" },
                    { 45, "Entity Framework", 44, "entity-framework" },
                    { 46, "Dapper", 44, "dapper" },
                    { 49, "JWT", 48, "jwt" },
                    { 50, "OAuth", 48, "oauth" },
                    { 51, "Basic Auth", 48, "basic-auth" },
                    { 53, "Roles", 52, "roles" },
                    { 54, "Policies", 52, "policies" },
                    { 55, "Claims", 52, "claims" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_EntityType_EntityId",
                table: "AuditLogs",
                columns: new[] { "EntityType", "EntityId" });

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_Timestamp",
                table: "AuditLogs",
                column: "Timestamp");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_ParentId",
                table: "Categories",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_Slug",
                table: "Categories",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CheatSheetResources_CategoryId",
                table: "CheatSheetResources",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_CheatSheetResources_CategoryId_Type",
                table: "CheatSheetResources",
                columns: new[] { "CategoryId", "Type" });

            migrationBuilder.CreateIndex(
                name: "IX_ImportJobs_UploadedByUserId_UploadedAtUtc",
                table: "ImportJobs",
                columns: new[] { "UploadedByUserId", "UploadedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_PrimaryMetrics_DevHexagonId",
                table: "PrimaryMetrics",
                column: "DevHexagonId");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_CategoryId",
                table: "Questions",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionVersions_QuestionId_VersionNumber",
                table: "QuestionVersions",
                columns: new[] { "QuestionId", "VersionNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_QuizAttemptQuestions_QuizAttemptId",
                table: "QuizAttemptQuestions",
                column: "QuizAttemptId");

            migrationBuilder.CreateIndex(
                name: "IX_QuizAttemptQuestions_QuizQuestionId",
                table: "QuizAttemptQuestions",
                column: "QuizQuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_QuizAttemptResponses_QuizAttemptQuestionId",
                table: "QuizAttemptResponses",
                column: "QuizAttemptQuestionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_QuizAttempts_UserId",
                table: "QuizAttempts",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_QuizQuestions_CategoryId",
                table: "QuizQuestions",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_QuizQuestions_ExternalId",
                table: "QuizQuestions",
                column: "ExternalId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SkillCategories_DevHexagonId",
                table: "SkillCategories",
                column: "DevHexagonId");

            migrationBuilder.CreateIndex(
                name: "IX_Skills_SkillCategoryId",
                table: "Skills",
                column: "SkillCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_StudyGuideSections_CategoryId",
                table: "StudyGuideSections",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_StudyGuideSections_ExternalId",
                table: "StudyGuideSections",
                column: "ExternalId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserProgresses_QuestionId",
                table: "UserProgresses",
                column: "QuestionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "CheatSheetResources");

            migrationBuilder.DropTable(
                name: "ImportJobs");

            migrationBuilder.DropTable(
                name: "PrimaryMetrics");

            migrationBuilder.DropTable(
                name: "QuestionVersions");

            migrationBuilder.DropTable(
                name: "QuizAttemptResponses");

            migrationBuilder.DropTable(
                name: "Skills");

            migrationBuilder.DropTable(
                name: "StudyGuideSections");

            migrationBuilder.DropTable(
                name: "UserProgresses");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "QuizAttemptQuestions");

            migrationBuilder.DropTable(
                name: "SkillCategories");

            migrationBuilder.DropTable(
                name: "Questions");

            migrationBuilder.DropTable(
                name: "QuizAttempts");

            migrationBuilder.DropTable(
                name: "QuizQuestions");

            migrationBuilder.DropTable(
                name: "DevHexagons");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "Categories");
        }
    }
}
