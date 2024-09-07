using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Transactions;
using Fin.Api.Common.Api;
using Fin.Core.Handlers;
using Fin.Core.Requests.Transactions;
using Fin.Core.Responses;

namespace Fin.Api.Endpoints.Transactions
{
    public class CreateTransactionEndpoint : IEndpoint
    {
        public static void Map(IEndpointRouteBuilder app)
       => app.MapPost("/", HandleAsync)
           .WithName("Transactions: Create")
           .WithSummary("Cria uma nova transação")
           .WithDescription("Cria uma nova transação")
           .WithOrder(1)
           .Produces<Response<Transaction?>>();

        private static async Task<IResult> HandleAsync(
            ClaimsPrincipal user,
            ITransactionHandler handler,
            CreateTransactionRequest request)
        {
            request.UserId = user.Identity?.Name ?? string.Empty;
            var result = await handler.CreateAsync(request);
            return result.IsSuccess
                ? TypedResults.Created($"/{result.Data?.Id}", result)
                : TypedResults.BadRequest(result.Data);
        }
    }
}