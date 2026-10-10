using Fin.Api.Data;
using Fin.Api.Handlers;
using Fin.Core.Enums;
using Fin.Core.Models;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Fin.Api.Tests.Handlers;

public class FinancialAccountHandlerTests
{
    [Fact]
    public async Task Summary_SubtractsSavingsFromAvailableBalance()
    {
        await using var context = CreateContext();
        context.Transactions.AddRange(
            Transaction("lucas", ETransactionType.Deposit, 5559.87m),
            Transaction("lucas", ETransactionType.Withdraw, -3432.19m),
            Transaction("lucas", ETransactionType.Saving, 1016.26m));
        await context.SaveChangesAsync();

        var summary = await new FinancialAccountHandler(context).GetSummaryAsync("lucas");

        Assert.Equal(2127.68m, summary.HistoricalResult);
        Assert.Equal(1016.26m, summary.SavingsBalance);
        Assert.Equal(1111.42m, summary.AvailableBalance);
        Assert.False(summary.IsReconciled);
    }

    [Fact]
    public async Task Reconcile_PreservesTheInformedBalanceAndFutureMovementsUpdateIt()
    {
        await using var context = CreateContext();
        context.Transactions.Add(Transaction("lucas", ETransactionType.Deposit, 1000m));
        await context.SaveChangesAsync();
        var handler = new FinancialAccountHandler(context);

        var reconciled = await handler.ReconcileAsync("lucas", 1874.02m);
        context.Transactions.Add(Transaction("lucas", ETransactionType.Withdraw, -74.02m));
        await context.SaveChangesAsync();
        var updated = await handler.GetSummaryAsync("lucas");

        Assert.Equal(1874.02m, reconciled.AvailableBalance);
        Assert.True(reconciled.IsReconciled);
        Assert.Equal(1800m, updated.AvailableBalance);
    }

    [Fact]
    public async Task Summary_UsesOnlyTheAuthenticatedUsersTransactionsAndAdjustment()
    {
        await using var context = CreateContext();
        context.Transactions.AddRange(
            Transaction("lucas", ETransactionType.Deposit, 100m),
            Transaction("outro", ETransactionType.Deposit, 9000m));
        await context.SaveChangesAsync();
        var handler = new FinancialAccountHandler(context);
        await handler.ReconcileAsync("outro", 50000m);

        var summary = await handler.GetSummaryAsync("lucas");

        Assert.Equal(100m, summary.AvailableBalance);
        Assert.Equal(100m, summary.HistoricalResult);
        Assert.False(summary.IsReconciled);
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

    private static Transaction Transaction(
        string userId,
        ETransactionType type,
        decimal amount)
        => new()
        {
            UserId = userId,
            Title = "Teste",
            CategoryId = 1,
            Type = type,
            Amount = amount,
            PaidOrReceivedAt = DateTime.Today
        };
}
