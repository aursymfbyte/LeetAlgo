using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LeetAlgo.Data.Migrations
{
    public partial class AddCatalogVersion : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CatalogVersions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    Stamp = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CatalogVersions", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "CatalogVersions",
                columns: new[] { "Id", "Stamp" },
                values: new object[] { 1, new Guid("00000000-0000-0000-0000-000000000000") });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CatalogVersions");
        }
    }
}
