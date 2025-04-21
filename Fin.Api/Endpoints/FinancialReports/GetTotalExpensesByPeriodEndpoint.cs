using System.Security.Claims;
using Fin.Api.Common.Api;
using Fin.Core.Handlers;
using Microsoft.AspNetCore.Mvc;

namespace Fin.Api.Endpoints.FinancialReports
{
    public class GetTotalExpensesByPeriodEndpoint : IEndpoint
    {
        public static void Map(IEndpointRouteBuilder app)
            => app.MapGet("/total-expenses", HandleAsync)
                .WithName("FinancialReports: GetTotalExpensesByPeriod")
                .WithSummary("Obtém o total de despesas em um período")
                .WithDescription("Retorna o total de despesas do usuário em um período específico")
                .WithOrder(3)
                .Produces<decimal>();

        private static async Task<IResult> HandleAsync(
            ClaimsPrincipal user,
            ITransactionHandler handler,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return TypedResults.BadRequest(0m);

            var totalExpenses = await handler.GetTotalExpensesByPeriod(userId, startDate, endDate);
            return TypedResults.Ok(totalExpenses);
        }                
    }    
}