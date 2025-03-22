using System.Security.Claims;
using Fin.Api.Common.Api;
using Fin.Core.Handlers;
using Microsoft.AspNetCore.Mvc;

namespace Fin.Api.Endpoints.FinancialReportsName
{
    public class GetTotalExpensesByPeriodEndpoint : IEndpoint
    {
        public static void Map(IEndpointRouteBuilder app)
            => app.MapGet("/expenses", HandleAsync)
                .WithName("FinancialReports: GetTotalExpenses")
                .WithSummary("Obtém o total de despesas em um período")
                .WithDescription("Retorna a soma de todas as despesas em um período específico")
                .WithOrder(3)
                .Produces<decimal>();

        private static async Task<IResult> HandleAsync(
            ClaimsPrincipal user,
            ITransactionHandler handler,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            var expenses = await handler.GetTotalExpensesByPeriod(startDate, endDate);
            return TypedResults.Ok(expenses);
        }                
    }    
}