using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Fin.Api.Common.Api;
using Fin.Core.Handlers;
using Fin.Core.Models;
using Fin.Core.Requests.Categories;
using Fin.Core.Responses;

namespace Fin.Api.Endpoints.Categories
{
    public class DeleteCategoryEndpoint : IEndpoint
    {
        public static void Map(IEndpointRouteBuilder app)
        => app.MapDelete("/{id}", HandleAsync)
            .WithName("Categories: Delete")
            .WithSummary("Exclui uma categoria")
            .WithDescription("Exclui uma categoria")
            .WithOrder(3)
            .Produces<Response<Category?>>();

        private static async Task<IResult> HandleAsync(
            ClaimsPrincipal user,
            ICategoryHandler handler,
            long id)
        {
            var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return TypedResults.BadRequest(new Response<Category?>(null, 400, "Usuário não encontrado"));

            var request = new DeleteCategoryRequest
            {
                UserId = userId,
                Id = id
            };

            var result = await handler.DeleteAsync(request);
            return result.IsSuccess
                ? TypedResults.Ok(result)
                : TypedResults.BadRequest(result);
        }
    }
}