using Fin.Api.Common.Api;
using Fin.Api.Models;
using Fin.Core.Requests.Account;
using Fin.Core.Responses;
using Microsoft.AspNetCore.Identity;

namespace Fin.Api.Endpoints.Identity;

public class ResetPasswordEndpoint : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app)
        => app.MapPost("/reset-password", HandleAsync)
            .WithName("Identity: Reset Password")
            .WithSummary("Definir uma nova senha")
            .AllowAnonymous()
            .RequireRateLimiting("password-recovery")
            .Produces<Response<string>>();

    private static async Task<IResult> HandleAsync(
        UserManager<User> userManager,
        ResetPasswordRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null)
            return InvalidTokenResponse();

        var result = await userManager.ResetPasswordAsync(
            user,
            request.Token,
            request.NewPassword);

        if (!result.Succeeded)
            return InvalidTokenResponse();

        return TypedResults.Ok(
            new Response<string>(null, 200, "Senha redefinida com sucesso. Você já pode entrar."));
    }

    private static IResult InvalidTokenResponse()
        => TypedResults.BadRequest(new Response<string>(
            null,
            StatusCodes.Status400BadRequest,
            "O link de recuperação é inválido, já foi utilizado ou expirou."));
}
