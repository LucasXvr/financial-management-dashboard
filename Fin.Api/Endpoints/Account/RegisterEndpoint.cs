using Fin.Api.Common.Api;
using Fin.Core.Models.Account;
using Fin.Core.Requests.Account;
using Fin.Core.Responses;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Fin.Api.Endpoints.Identity
{
    public class RegisterEndpoint : IEndpoint
    {
        public static void Map(IEndpointRouteBuilder app)
         => app.MapPost("/register", HandleAsync)
            .WithName("Identity: Register")
            .WithSummary("Registrar novo usuário")
            .WithDescription("Registra um novo usuário no sistema")
            .WithOrder(2)
            .AllowAnonymous()
            .Produces<Response<string>>();

        private static async Task<IResult> HandleAsync(
            [FromServices] UserManager<User> userManager,
            [FromBody] RegisterRequest request)
        {
            var user = new User
            {                
                Email = request.Email,
                IsEmailConfirmed = true
            };

            var result = await userManager.CreateAsync(user, request.Password);

            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(user, "User");

                return TypedResults.Created($"/users/{user.Id}",
                    new Response<string>("Usuário registrado com sucesso", 201));
            }

            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return TypedResults.BadRequest(
                new Response<string>($"Erro ao registrar usuário: {errors}", 400));
        }
    }
}