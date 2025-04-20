using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Fin.Api.Common.Api;
using Fin.Core.Handlers;
using Fin.Core.Models;
using Fin.Core.Requests.Transactions;
using Fin.Core.Responses;

namespace Fin.Api.Endpoints.Transactions
{
    public class DeleteTransactionEndpoint : IEndpoint
    {
        public static void Map(IEndpointRouteBuilder app)
            => app.MapDelete("/{id}", HandleAsync)
                .WithName("Transactions: Delete")
                .WithSummary("Exclui uma transação")
                .WithDescription("Exclui uma transação")
                .WithOrder(3)
                .Produces<Response<Transaction?>>();

        private static async Task<IResult> HandleAsync(
            ClaimsPrincipal user,
            ITransactionHandler handler,
            long id)
        {
            var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return TypedResults.BadRequest(new Response<Transaction?>(null, 400, "Usuário não encontrado"));

            var request = new DeleteTransactionRequest
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