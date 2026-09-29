using Fin.Api.Data;
using Fin.Api.Handlers;
using Fin.Core.Enums;
using Fin.Core.Models;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Fin.Api.Tests.Handlers;

public class FinancialReportCalculationTests
{
    private const string UserId = "report-user";
    private static readonly DateTime PeriodStart = new(DateTime.Now.Year, DateTime.Now.Month, 1);
    private static readonly DateTime PeriodEnd = PeriodStart.AddMonths(1).AddTicks(-1);

    [Fact]
    public async Task KnownTransactions_ReturnExpectedIncomeExpensesAndBalance()
    {
        await using var context = CreateContext();
        await SeedKnownTransactionsAsync(context);
        var handler = new TransactionHandler(context);

        var income = await handler.GetTotalIncomeByPeriod(UserId, PeriodStart, PeriodEnd);
        var expenses = await handler.GetTotalExpensesByPeriod(UserId, PeriodStart, PeriodEnd);
        var balance = await handler.GetCurrentBalance(UserId);

        Assert.Equal(1250.50m, income);
        Assert.Equal(200.25m, expenses);
        Assert.Equal(1050.25m, balance);
    }

    [Fact]
    public async Task MonthlyReports_ReturnPositiveExpensesAndCorrectBalance()
    {
        await using var context = CreateContext();
        await SeedKnownTransactionsAsync(context);
        var handler = new TransactionHandler(context);

        var monthly = (await handler.GetTransactionsByMonth(UserId, 1)).Single();
        var balance = (await handler.GetBalanceOverTime(UserId, 1)).Single();
        var byCategory = (await handler.GetExpensesByCategory(
            UserId,
            PeriodStart,
            PeriodEnd)).Single();

        Assert.Equal(1250.50m, monthly.Income);
        Assert.Equal(200.25m, monthly.Expenses);
        Assert.Equal(1050.25m, balance.Balance);
        Assert.Equal(200.25m, byCategory.Amount);
    }

    [Fact]
    public async Task CurrentMonthTotalsAndTransactions_UseTheSamePeriodIncludingLastDay()
    {
        await using var context = CreateContext();
        await SeedKnownTransactionsAsync(context);
        var handler = new TransactionHandler(context);

        var income = await handler.GetTotalIncomeByPeriod(UserId, PeriodStart, PeriodEnd);
        var expenses = await handler.GetTotalExpensesByPeriod(UserId, PeriodStart, PeriodEnd);
        var transactions = await handler.GetByPeriodAsync(new()
        {
            UserId = UserId,
            StartDate = PeriodStart,
            EndDate = PeriodEnd,
            PageNumber = 1,
            PageSize = 10
        });

        Assert.Equal(1250.50m, income);
        Assert.Equal(200.25m, expenses);
        Assert.Equal(3, transactions.TotalCount);
        Assert.Contains(transactions.Data!, item =>
            item.Title == "Mercado" && item.PaidOrReceivedAt == PeriodEnd.Date.AddHours(18).AddMinutes(30));
    }

    [Fact]
    public async Task MonthWithoutTransactions_ReturnsZeroTotalsAndEmptyPageWhileBalanceRemainsAccumulated()
    {
        await using var context = CreateContext();
        await SeedKnownTransactionsAsync(context);
        var handler = new TransactionHandler(context);
        var emptyStart = PeriodStart.AddMonths(-1);
        var emptyEnd = PeriodStart.AddTicks(-1);

        var income = await handler.GetTotalIncomeByPeriod(UserId, emptyStart, emptyEnd);
        var expenses = await handler.GetTotalExpensesByPeriod(UserId, emptyStart, emptyEnd);
        var transactions = await handler.GetByPeriodAsync(new()
        {
            UserId = UserId,
            StartDate = emptyStart,
            EndDate = emptyEnd,
            PageNumber = 1,
            PageSize = 10
        });
        var accumulatedBalance = await handler.GetCurrentBalance(UserId);

        Assert.Equal(0m, income);
        Assert.Equal(0m, expenses);
        Assert.Equal(0, transactions.TotalCount);
        Assert.Empty(transactions.Data!);
        Assert.Equal(1050.25m, accumulatedBalance);
    }

    [Fact]
    public async Task SixMonthReport_ReturnsPositiveExpensesAndZerosForEmptyMonths()
    {
        await using var context = CreateContext();
        var category = await AddCategoryAsync(context);
        var currentMonth = PeriodStart;

        context.Transactions.AddRange(
            Transaction(category, "Receita antiga", ETransactionType.Deposit, 1000m, currentMonth.AddMonths(-5).AddDays(2)),
            Transaction(category, "Despesa antiga", ETransactionType.Withdraw, -100m, currentMonth.AddMonths(-5).AddDays(3)),
            Transaction(category, "Despesa intermediária", ETransactionType.Withdraw, -50m, currentMonth.AddMonths(-3).AddDays(4)),
            Transaction(category, "Receita intermediária", ETransactionType.Deposit, 250.50m, currentMonth.AddMonths(-2).AddDays(5)),
            Transaction(category, "Receita atual", ETransactionType.Deposit, 500m, currentMonth.AddDays(6)),
            Transaction(category, "Despesa atual", ETransactionType.Withdraw, -123.45m, PeriodEnd));
        await context.SaveChangesAsync();

        var result = await new TransactionHandler(context).GetTransactionsByMonth(UserId, 6);

        Assert.Collection(
            result,
            item => AssertMonth(item, 1000m, 100m),
            item => AssertMonth(item, 0m, 0m),
            item => AssertMonth(item, 0m, 50m),
            item => AssertMonth(item, 250.50m, 0m),
            item => AssertMonth(item, 0m, 0m),
            item => AssertMonth(item, 500m, 123.45m));
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

    private static async Task SeedKnownTransactionsAsync(AppDbContext context)
    {
        var category = await AddCategoryAsync(context);

        context.Transactions.AddRange(
            Transaction(category, "Salário", ETransactionType.Deposit, 1000m, PeriodStart.AddDays(4)),
            Transaction(category, "Freelance", ETransactionType.Deposit, 250.50m, PeriodStart.AddDays(9)),
            Transaction(category, "Mercado", ETransactionType.Withdraw, -200.25m, PeriodEnd.Date.AddHours(18).AddMinutes(30)));
        await context.SaveChangesAsync();
    }

    private static async Task<Category> AddCategoryAsync(AppDbContext context)
    {
        var category = new Category
        {
            UserId = UserId,
            Title = "Teste",
            Description = "Categoria de teste"
        };
        context.Categories.Add(category);
        await context.SaveChangesAsync();
        return category;
    }

    private static void AssertMonth(
        Fin.Core.Responses.TransactionsByMonthDTO item,
        decimal income,
        decimal expenses)
    {
        Assert.Equal(income, item.Income);
        Assert.Equal(expenses, item.Expenses);
    }

    private static Transaction Transaction(
        Category category,
        string title,
        ETransactionType type,
        decimal amount,
        DateTime paidAt)
        => new()
        {
            UserId = UserId,
            CategoryId = category.Id,
            Category = category,
            Title = title,
            Type = type,
            Amount = amount,
            PaidOrReceivedAt = paidAt
        };
}
