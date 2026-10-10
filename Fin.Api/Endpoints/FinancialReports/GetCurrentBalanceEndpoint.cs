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
            .WithSummary("Obtém o saldo disponível")
            .WithDescription("Retorna o saldo disponível após despesas e reservas")
            .WithOrder(1)
            .Produces<decimal>();

        private static async Task<IResult> HandleAsync(
            ClaimsPrincipal user,
            IFinancialAccountHandler handler)
        {
            var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return TypedResults.BadRequest(0m);

            var account = await handler.GetSummaryAsync(userId);
            return TypedResults.Ok(account.AvailableBalance);
        }
    }
}
