namespace Fin.Core.Responses
{
    public class TransactionsByMonthDTO
    {
        public required string Month { get; set; }
        public required decimal Income { get; set; }
        public required decimal Expenses { get; set; }
    }
}