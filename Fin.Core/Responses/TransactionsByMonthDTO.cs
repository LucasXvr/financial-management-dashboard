namespace Fin.Core.Responses
{
    public class TransactionsByMonthDTO
    {
        public string Month { get; set; }
        public decimal Income { get; set; }
        public decimal Expenses { get; set; }
    }
}