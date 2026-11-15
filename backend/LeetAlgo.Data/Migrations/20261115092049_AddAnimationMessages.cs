using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LeetAlgo.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAnimationMessages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AnimationMessages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProblemId = table.Column<int>(type: "int", nullable: false),
                    Version = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Step = table.Column<int>(type: "int", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AnimationMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AnimationMessages_Problems_ProblemId",
                        column: x => x.ProblemId,
                        principalTable: "Problems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AnimationMessages_ProblemId_Version_Step",
                table: "AnimationMessages",
                columns: new[] { "ProblemId", "Version", "Step" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AnimationMessages");
        }
    }
}
