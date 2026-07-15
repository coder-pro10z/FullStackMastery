using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterviewPrepApp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class DropLegacyColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AnswerText",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "Questions");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AnswerText",
                table: "Questions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "Questions",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
