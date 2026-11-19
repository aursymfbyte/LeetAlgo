using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LeetAlgo.Data.Migrations
{
    public partial class AddContentRevisions : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "Revision",
                table: "Terms",
                type: "rowversion",
                rowVersion: true,
                nullable: false);

            migrationBuilder.AddColumn<byte[]>(
                name: "Revision",
                table: "AnimationMessages",
                type: "rowversion",
                rowVersion: true,
                nullable: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Revision",
                table: "Terms");

            migrationBuilder.DropColumn(
                name: "Revision",
                table: "AnimationMessages");
        }
    }
}
