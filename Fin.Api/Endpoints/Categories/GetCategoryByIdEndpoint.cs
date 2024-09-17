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
    public class GetCategoryByIdEndpoint : IEndpoint
    {
        public static void Map(IEndpointRouteBuilder app)
            => app.MapGet("/{id}", HandleAsync)
                .WithName("Categories: Get By Id")
                .WithSummary("Recupera uma categoria")
                .WithDescription("Recupera uma categoria")
                .WithOrder(4)
                .Produces<Response<Category?>>();

        private static async Task<IResult> HandleAsync(
            ClaimsPrincipal user,
            ICategoryHandler handler,
            long id)
        {
            var request = new GetCategoryByIdRequest
            {
                UserId = user.Identity?.Name ?? string.Empty,
                Id = id
            };

            var result = await handler.GetByIdAsync(request);
            return result.IsSuccess
                ? TypedResults.Ok(result)
                : TypedResults.BadRequest(result);
        }
    }
}