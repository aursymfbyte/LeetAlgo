using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LeetAlgo.Data.Migrations
{
    public partial class AddProblemRevision : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "Revision",
                table: "Problems",
                type: "uniqueidentifier",
                nullable: false,
                defaultValueSql: "NEWID()");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Revision",
                table: "Problems");
        }
    }
}
