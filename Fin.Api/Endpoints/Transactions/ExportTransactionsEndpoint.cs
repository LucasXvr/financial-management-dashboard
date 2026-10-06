using System.Security.Claims;
using Fin.Api.Common.Api;
using Fin.Api.Services;
using Fin.Core.Common.Extensions;
using Microsoft.AspNetCore.Mvc;

namespace Fin.Api.Endpoints.Transactions;

public class ExportTransactionsEndpoint : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app)
        => app.MapGet("/export", HandleAsync)
            .WithName("Transactions: Export Excel")
            .WithSummary("Exportar transações em Excel")
            .WithDescription("Exporta todas as transações do usuário autenticado no período informado")
            .WithOrder(6)
            .Produces(StatusCodes.Status200OK, contentType:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
            .ProducesProblem(StatusCodes.Status400BadRequest);

    private static async Task<IResult> HandleAsync(
        ClaimsPrincipal user,
        ITransactionExportService exportService,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
            return TypedResults.Unauthorized();

        var periodStart = startDate?.Date ?? DateTime.Now.GetFirstDay();
        var periodEnd = endDate?.Date.AddDays(1).AddTicks(-1) ?? DateTime.Now.GetLastDay();
        if (periodStart > periodEnd)
            return TypedResults.Problem(
                "A data inicial deve ser anterior ou igual à data final.",
                statusCode: StatusCodes.Status400BadRequest);

        var file = await exportService.ExportAsync(
            userId,
            periodStart,
            periodEnd,
            cancellationToken);
        var fileName = $"transacoes-{periodStart:yyyy-MM-dd}-a-{periodEnd:yyyy-MM-dd}.xlsx";

        return TypedResults.File(
            file,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileName);
    }
}
