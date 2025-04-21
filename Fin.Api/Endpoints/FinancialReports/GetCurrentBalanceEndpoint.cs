using System.Security.Claims;
using Fin.Api.Common.Api;
using Fin.Core.Handlers;
using Microsoft.AspNetCore.Mvc;

namespace Fin.Api.Endpoints.FinancialReports
{
    public class GetCurrentBalanceEndpoint : IEndpoint
    {
        public static void Map(IEndpointRouteBuilder app)
        => app.MapGet("/current-balance", HandleAsync)
            .WithName("FinancialReports: GetCurrentBalance")
            .WithSummary("Obtém o saldo atual")
            .WithDescription("Retorna o saldo atual do usuário")
            .WithOrder(1)
            .Produces<decimal>();

        private static async Task<IResult> HandleAsync(
            ClaimsPrincipal user,
            ITransactionHandler handler)
        {
            var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return TypedResults.BadRequest(0m);

            var balance = await handler.GetCurrentBalance(userId);
            return TypedResults.Ok(balance);
        }
    }
}