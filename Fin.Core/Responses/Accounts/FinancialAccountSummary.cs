namespace Fin.Core.Responses.Accounts;

public class FinancialAccountSummary
{
    public string Name { get; set; } = "Conta principal";
    public decimal AvailableBalance { get; set; }
    public decimal HistoricalResult { get; set; }
    public decimal SavingsBalance { get; set; }
    public bool IsReconciled { get; set; }
}
