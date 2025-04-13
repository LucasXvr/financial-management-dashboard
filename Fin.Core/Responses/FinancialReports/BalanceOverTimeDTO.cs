namespace Fin.Core.Responses
{
    public class BalanceOverTimeDTO
    {
        public required string Month { get; set; }
        public required decimal Balance { get; set; }
    }
}