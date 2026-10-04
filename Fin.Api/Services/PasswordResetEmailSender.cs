using System.Net;
using System.Net.Mail;
using System.Text.Encodings.Web;
using Microsoft.Extensions.Options;

namespace Fin.Api.Services;

public sealed class EmailSettings
{
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; } = 25;
    public string FromAddress { get; set; } = "no-reply@minhasfinancas.local";
    public string FromName { get; set; } = "Minhas Finanças";
    public string? Username { get; set; }
    public string? Password { get; set; }
    public bool EnableSsl { get; set; }
}

public interface IPasswordResetEmailSender
{
    Task SendAsync(string recipient, string resetLink, CancellationToken cancellationToken);
}

public sealed class PasswordResetEmailSender(
    IOptions<EmailSettings> options) : IPasswordResetEmailSender
{
    private readonly EmailSettings _settings = options.Value;

    public async Task SendAsync(
        string recipient,
        string resetLink,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_settings.Host))
            throw new InvalidOperationException("EmailSettings.Host não foi configurado");

        using var message = new MailMessage
        {
            From = new MailAddress(_settings.FromAddress, _settings.FromName),
            Subject = "Recuperação de senha",
            Body = $"""
                <h2>Recuperação de senha</h2>
                <p>Recebemos uma solicitação para alterar a senha da sua conta.</p>
                <p><a href="{HtmlEncoder.Default.Encode(resetLink)}">Definir nova senha</a></p>
                <p>Este link expira em 30 minutos. Se você não fez esta solicitação, ignore este email.</p>
                """,
            IsBodyHtml = true
        };
        message.To.Add(recipient);

        using var client = new SmtpClient(_settings.Host, _settings.Port)
        {
            EnableSsl = _settings.EnableSsl,
            UseDefaultCredentials = false
        };

        if (!string.IsNullOrWhiteSpace(_settings.Username))
            client.Credentials = new NetworkCredential(_settings.Username, _settings.Password);

        await client.SendMailAsync(message, cancellationToken);
    }
}
