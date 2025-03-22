namespace Fin.Core.Responses
{
    public class DashboardSummaryDTO
    {
        public decimal CurrentBalance { get; set; }
        public decimal TotalIncome { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal Savings { get; set; }
        public decimal IncomeGrowthPercentage { get; set; }
        public decimal ExpensesGrowthPercentage { get; set; }
        public decimal SavingsGrowthPercentage { get; set; }
    }
}