using Fin.Core.Responses.Accounts;

namespace Fin.Core.Handlers;

public interface IFinancialAccountHandler
{
    Task<FinancialAccountSummary> GetSummaryAsync(string userId);
    Task<FinancialAccountSummary> ReconcileAsync(string userId, decimal currentBalance);
}
