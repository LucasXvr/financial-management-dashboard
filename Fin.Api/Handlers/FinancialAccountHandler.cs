using Fin.Api.Data;
using Fin.Core.Enums;
using Fin.Core.Handlers;
using Fin.Core.Models;
using Fin.Core.Responses.Accounts;
using Microsoft.EntityFrameworkCore;

namespace Fin.Api.Handlers;

public class FinancialAccountHandler(AppDbContext context) : IFinancialAccountHandler
{
    public async Task<FinancialAccountSummary> GetSummaryAsync(string userId)
    {
        var totals = await GetTransactionTotalsAsync(userId);
        var account = await context.FinancialAccounts
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.UserId == userId);

        return CreateSummary(account, totals);
    }

    public async Task<FinancialAccountSummary> ReconcileAsync(
        string userId,
        decimal currentBalance)
    {
        var totals = await GetTransactionTotalsAsync(userId);
        var account = await context.FinancialAccounts
            .SingleOrDefaultAsync(x => x.UserId == userId);

        if (account is null)
        {
            account = new FinancialAccount { UserId = userId };
            context.FinancialAccounts.Add(account);
        }

        account.BalanceAdjustment = currentBalance - totals.AvailableMovement;
        await context.SaveChangesAsync();

        return CreateSummary(account, totals);
    }

    private async Task<TransactionTotals> GetTransactionTotalsAsync(string userId)
    {
        var totals = await context.Transactions
            .Where(x => x.UserId == userId)
            .GroupBy(_ => 1)
            .Select(group => new TransactionTotals(
                group.Where(x => x.Type == ETransactionType.Deposit ||
                                 x.Type == ETransactionType.Withdraw)
                    .Sum(x => x.Amount),
                group.Where(x => x.Type == ETransactionType.Saving)
                    .Sum(x => x.Amount)))
            .SingleOrDefaultAsync();

        return totals ?? new TransactionTotals(0, 0);
    }

    private static FinancialAccountSummary CreateSummary(
        FinancialAccount? account,
        TransactionTotals totals)
        => new()
        {
            Name = account?.Name ?? "Conta principal",
            HistoricalResult = totals.HistoricalResult,
            SavingsBalance = totals.Savings,
            AvailableBalance = (account?.BalanceAdjustment ?? 0) + totals.AvailableMovement,
            IsReconciled = account is not null
        };

    private sealed record TransactionTotals(decimal HistoricalResult, decimal Savings)
    {
        public decimal AvailableMovement => HistoricalResult - Savings;
    }
}
