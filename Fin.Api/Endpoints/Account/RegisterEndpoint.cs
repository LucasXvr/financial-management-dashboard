using Fin.Api.Common.Api;
using Fin.Api.Models;
using Fin.Api.Services;
using Fin.Core.Requests.Account;
using Fin.Core.Responses;
using Microsoft.AspNetCore.Identity;

namespace Fin.Api.Endpoints.Identity;

public class RegisterEndpoint : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app)
        => app.MapPost("/register", HandleAsync)
              .WithTags("Account");

    private static async Task<IResult> HandleAsync(
        RegisterRequest request,
        UserManager<User> userManager,
        ITokenService tokenService)
    {
        var user = new User
        {
            UserName = request.Email,
            Email = request.Email
        };

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => e.Description);
            return Results.BadRequest(new Response<string>(string.Join(", ", errors)));
        }

        var token = await tokenService.GenerateTokenAsync(user);
        return Results.Ok(new Response<AuthResponseDTO>(token));
    }
}