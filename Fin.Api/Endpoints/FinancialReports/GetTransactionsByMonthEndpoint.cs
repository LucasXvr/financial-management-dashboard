using System.Security.Claims;
using Fin.Api.Common.Api;
using Fin.Core.Handlers;
using Fin.Core.Responses;
using Microsoft.AspNetCore.Mvc;

namespace Fin.Api.Endpoints.FinancialReports
{
    public class GetTransactionsByMonthEndpoint : IEndpoint
    {
        public static void Map(IEndpointRouteBuilder app)
        => app.MapGet("/by-month", HandleAsync)
            .WithName("FinancialReports: GetTransactionsByMonth")
            .WithSummary("Obtém as transações agrupadas por mês")
            .WithDescription("Retorna as transações (receitas e despesas) agrupadas por mês para um número específico de meses")
            .WithOrder(7)
            .Produces<List<TransactionsByMonthDTO>>();

        private static async Task<IResult> HandleAsync(
            ClaimsPrincipal user,
            ITransactionHandler handler,
            [FromQuery] int months = 6)
        {
            var transactionsByMonth = await handler.GetTransactionsByMonth(months);
            return TypedResults.Ok(transactionsByMonth);
        }
    }
}