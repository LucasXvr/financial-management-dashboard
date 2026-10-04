using System.ComponentModel.DataAnnotations;

namespace Fin.Core.Requests.Account;

public class ForgotPasswordRequest
{
    [Required(ErrorMessage = "E-mail obrigatório")]
    [EmailAddress(ErrorMessage = "E-mail inválido")]
    public string Email { get; set; } = string.Empty;
}
