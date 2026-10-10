using System.ComponentModel.DataAnnotations;

namespace Fin.Core.Requests.Accounts;

public class UpdateCurrentBalanceRequest : Request
{
    [Range(typeof(decimal), "-999999999999.99", "999999999999.99",
        ErrorMessage = "Saldo atual inválido")]
    public decimal CurrentBalance { get; set; }
}
