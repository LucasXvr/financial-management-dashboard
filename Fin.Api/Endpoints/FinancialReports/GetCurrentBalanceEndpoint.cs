using System.Security.Claims;
using Fin.Api.Common.Api;
using Fin.Core.Handlers;

namespace Fin.Api.Endpoints.FinancialReports
{
    public class GetCurrentBalanceEndpoint : IEndpoint
    {
        public static void Map(IEndpointRouteBuilder app)
        => app.MapGet("/balance", HandleAsync)
            .WithName("FinancialReports: GetBalance")
            .WithSummary("Obtém o saldo atual")
            .WithDescription("Retorna o saldo atual considerando todas as transações")
            .WithOrder(1)
            .Produces<decimal>();

        private static async Task<IResult> HandleAsync(
            ClaimsPrincipal user,
            ITransactionHandler handler)
        {
            var balance = await handler.GetCurrentBalance();
            return TypedResults.Ok(balance);
        }
    }
}