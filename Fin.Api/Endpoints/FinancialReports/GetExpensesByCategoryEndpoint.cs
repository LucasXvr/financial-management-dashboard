using System.Security.Claims;
using Fin.Api.Common.Api;
using Fin.Core.Handlers;
using Fin.Core.Responses;
using Microsoft.AspNetCore.Mvc;

namespace Fin.Api.Endpoints.FinancialReports
{
    public class GetExpensesByCategoryEndpoint : IEndpoint
    {
        public static void Map(IEndpointRouteBuilder app)
        => app.MapGet("/expenses-by-category", HandleAsync)
            .WithName("FinancialReports: GetExpensesByCategory")
            .WithSummary("Obtém as despesas por categoria")
            .WithDescription("Retorna as despesas agrupadas por categoria em um período específico")
            .WithOrder(6)
            .Produces<List<ExpensesByCategoryDTO>>();

      private static async Task<IResult> HandleAsync(
            ClaimsPrincipal user,
            ITransactionHandler handler,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            var expensesByCategory = await handler.GetExpensesByCategory(startDate, endDate);
            return TypedResults.Ok(expensesByCategory);
        }
    }
}