using System.ComponentModel.DataAnnotations;

namespace Fin.Core.Requests.Account;

public class ResetPasswordRequest
{
    [Required(ErrorMessage = "E-mail obrigatório")]
    [EmailAddress(ErrorMessage = "E-mail inválido")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Token obrigatório")]
    public string Token { get; set; } = string.Empty;

    [Required(ErrorMessage = "Nova senha obrigatória")]
    public string NewPassword { get; set; } = string.Empty;
}
