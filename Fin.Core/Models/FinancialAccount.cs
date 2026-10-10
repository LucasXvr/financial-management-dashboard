namespace Fin.Core.Models;

public class FinancialAccount
{
    public long Id { get; set; }
    public string Name { get; set; } = "Conta principal";
    public decimal BalanceAdjustment { get; set; }
    public string UserId { get; set; } = string.Empty;
}
