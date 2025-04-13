namespace Fin.Core.Responses
{
    public class ExpensesByCategoryDTO
    {
        public required string Category { get; set; }
        public required decimal Amount { get; set; }
    }
}