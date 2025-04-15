using Fin.Api.Common.Api;
using Fin.Api.Services;
using Fin.Core.Common.Extensions;
using Fin.Api.Models;
using Fin.Core.Requests.Account;
using Fin.Core.Responses;
using Fin.Core.Responses.Account;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

public class LoginEndpoint : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app)
        => app.MapPost("/login", HandleAsync)
            .WithName("Identity: Login")
            .WithSummary("Autenticar usuário")
            .WithDescription("Autentica um usuário e retorna um token JWT")
            .WithOrder(1)
            .AllowAnonymous()
            .Produces<Response<LoginResponse>>();

    private static async Task<IResult> HandleAsync(
        [FromServices] UserManager<User> userManager,
        [FromServices] SignInManager<User> signInManager,
        [FromServices] ITokenService tokenService,
        [FromServices] JwtSettings jwtSettings,
        [FromBody] LoginRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            return TypedResults.BadRequest(
                new Response<LoginResponse>(null, 404, "Usuário não encontrado"));
        }

        var result = await signInManager.CheckPasswordSignInAsync(user, request.Password, false);
        if (!result.Succeeded)
        {
            return TypedResults.BadRequest(
                new Response<LoginResponse>(null, 500, "Credenciais inválidas"));
        }

        var roles = await userManager.GetRolesAsync(user);
        var token = tokenService.GenerateJwtToken(user, roles);

        if (user == null)
            return TypedResults.BadRequest(
                new Response<LoginResponse>(null, 500, "Erro ao processar login: usuário não encontrado"));

        if (user.Email == null)
            return TypedResults.BadRequest(
                new Response<LoginResponse>(null, 500, "Erro ao processar login: email do usuário não encontrado"));

        var loginResponse = new LoginResponse
        {
            UserId = user.Id.ToString(),
            Email = user.Email,
            Token = token,
            Roles = roles.ToList(),
            Expiration = DateTime.UtcNow.AddMinutes(jwtSettings.ExpiryInMinutes)
        };

        return TypedResults.Ok(
            new Response<LoginResponse>(loginResponse, 200, "Login realizado com sucesso"));
    }
}