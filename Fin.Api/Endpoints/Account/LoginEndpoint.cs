using Fin.Api.Common.Api;
using Fin.Api.Models;
using Fin.Api.Services;
using Fin.Core.Requests.Account;
using Fin.Core.Responses;
using Microsoft.AspNetCore.Identity;

namespace Fin.Api.Endpoints.Identity;

public class LoginEndpoint : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app)
        => app.MapPost("/login", HandleAsync)
              .WithTags("Account");

    private static async Task<IResult> HandleAsync(
        LoginRequest request,
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        ITokenService tokenService)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null)
            return Results.BadRequest(new Response<string>("Usuário não encontrado"));

        var result = await signInManager.CheckPasswordSignInAsync(user, request.Password, false);
        if (!result.Succeeded)
            return Results.BadRequest(new Response<string>("Senha inválida"));

        var token = await tokenService.GenerateTokenAsync(user);

        return Results.Ok(new Response<AuthResponseDTO>(token));
    }
}