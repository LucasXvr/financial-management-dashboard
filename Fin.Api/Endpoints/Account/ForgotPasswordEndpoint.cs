using Fin.Api.Common.Api;
using Fin.Api.Models;
using Fin.Api.Services;
using Fin.Core.Requests.Account;
using Fin.Core.Responses;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;

namespace Fin.Api.Endpoints.Identity;

public class ForgotPasswordEndpoint : IEndpoint
{
    private const string GenericMessage =
        "Se o email estiver cadastrado, você receberá as instruções para redefinir sua senha.";

    public static void Map(IEndpointRouteBuilder app)
        => app.MapPost("/forgot-password", HandleAsync)
            .WithName("Identity: Forgot Password")
            .WithSummary("Solicitar recuperação de senha")
            .AllowAnonymous()
            .RequireRateLimiting("password-recovery")
            .Produces<Response<string>>();

    private static async Task<IResult> HandleAsync(
        UserManager<User> userManager,
        IPasswordResetEmailSender emailSender,
        IConfiguration configuration,
        ILogger<ForgotPasswordEndpoint> logger,
        ForgotPasswordRequest request,
        CancellationToken cancellationToken)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user?.Email is null)
            return TypedResults.Ok(new Response<string>(null, 200, GenericMessage));

        try
        {
            var token = await userManager.GeneratePasswordResetTokenAsync(user);
            var frontendUrl = configuration["FrontendUrl"]?.TrimEnd('/');
            if (string.IsNullOrWhiteSpace(frontendUrl))
                throw new InvalidOperationException("FrontendUrl não foi configurado");

            var resetLink = QueryHelpers.AddQueryString(
                $"{frontendUrl}/reset-password",
                new Dictionary<string, string?>
                {
                    ["email"] = user.Email,
                    ["token"] = token
                });

            await emailSender.SendAsync(user.Email, resetLink, cancellationToken);
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Não foi possível enviar o email de recuperação de senha");
        }

        return TypedResults.Ok(new Response<string>(null, 200, GenericMessage));
    }
}
