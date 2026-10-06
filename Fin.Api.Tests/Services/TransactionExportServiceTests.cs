using ClosedXML.Excel;
using Fin.Api.Data;
using Fin.Api.Services;
using Fin.Core.Enums;
using Fin.Core.Models;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Fin.Api.Tests.Services;

public class TransactionExportServiceTests
{
    [Fact]
    public async Task Export_IncludesAllPeriodRowsForAuthenticatedUserWithTypedCells()
    {
        await using var context = CreateContext();
        var firstCategory = AddCategory(context, "user-a", "Casa");
        var secondCategory = AddCategory(context, "user-b", "Privada");
        context.Transactions.AddRange(
            Transaction("user-a", firstCategory, "Salário", 1234.56m, new DateTime(2026, 9, 2), ETransactionType.Deposit),
            Transaction("user-a", firstCategory, "Mercado", -200.25m, new DateTime(2026, 9, 15), ETransactionType.Withdraw),
            Transaction("user-a", firstCategory, "Fora do período", 99m, new DateTime(2026, 8, 31), ETransactionType.Deposit),
            Transaction("user-b", secondCategory, "Outro usuário", 9999m, new DateTime(2026, 9, 10), ETransactionType.Deposit));
        for (var index = 0; index < 10; index++)
        {
            context.Transactions.Add(Transaction(
                "user-a",
                firstCategory,
                $"Registro extra {index + 1}",
                index + 1,
                new DateTime(2026, 9, 16 + index),
                ETransactionType.Deposit));
        }
        await context.SaveChangesAsync();

        var bytes = await new TransactionExportService(context).ExportAsync(
            "user-a",
            new DateTime(2026, 9, 1),
            new DateTime(2026, 9, 30, 23, 59, 59));

        using var workbook = new XLWorkbook(new MemoryStream(bytes));
        var worksheet = workbook.Worksheet("Transações");

        Assert.Equal("Salário", worksheet.Cell(2, 2).GetString());
        Assert.Equal("Mercado", worksheet.Cell(3, 2).GetString());
        Assert.Equal(13, worksheet.LastRowUsed()!.RowNumber());
        Assert.Equal(XLDataType.DateTime, worksheet.Cell(2, 1).DataType);
        Assert.Equal(XLDataType.Number, worksheet.Cell(2, 5).DataType);
        Assert.Equal(1234.56, worksheet.Cell(2, 5).GetDouble(), 2);
        Assert.Equal(-200.25, worksheet.Cell(3, 5).GetDouble(), 2);
        Assert.DoesNotContain("Outro usuário", worksheet.CellsUsed().Select(cell => cell.GetString()));
        Assert.DoesNotContain("Fora do período", worksheet.CellsUsed().Select(cell => cell.GetString()));
    }

    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        var context = new AppDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }

    private static Category AddCategory(AppDbContext context, string userId, string title)
    {
        var category = new Category { UserId = userId, Title = title };
        context.Categories.Add(category);
        return category;
    }

    private static Transaction Transaction(
        string userId,
        Category category,
        string title,
        decimal amount,
        DateTime date,
        ETransactionType type) => new()
        {
            UserId = userId,
            Category = category,
            Title = title,
            Amount = amount,
            PaidOrReceivedAt = date,
            Type = type
        };
}
