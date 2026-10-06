using ClosedXML.Excel;
using Fin.Api.Data;
using Fin.Core.Enums;
using Microsoft.EntityFrameworkCore;

namespace Fin.Api.Services;

public interface ITransactionExportService
{
    Task<byte[]> ExportAsync(
        string userId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default);
}

public sealed class TransactionExportService(AppDbContext context) : ITransactionExportService
{
    public async Task<byte[]> ExportAsync(
        string userId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        var transactions = await context.Transactions
            .AsNoTracking()
            .Include(transaction => transaction.Category)
            .Where(transaction =>
                transaction.UserId == userId &&
                transaction.PaidOrReceivedAt >= startDate &&
                transaction.PaidOrReceivedAt <= endDate)
            .OrderBy(transaction => transaction.PaidOrReceivedAt)
            .ThenBy(transaction => transaction.Id)
            .ToListAsync(cancellationToken);

        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Transações");
        var headers = new[] { "Data", "Título", "Tipo", "Categoria", "Valor" };

        for (var column = 0; column < headers.Length; column++)
            worksheet.Cell(1, column + 1).Value = headers[column];

        for (var index = 0; index < transactions.Count; index++)
        {
            var transaction = transactions[index];
            var row = index + 2;

            if (transaction.PaidOrReceivedAt.HasValue)
                worksheet.Cell(row, 1).Value = transaction.PaidOrReceivedAt.Value;

            worksheet.Cell(row, 2).Value = transaction.Title;
            worksheet.Cell(row, 3).Value = TypeLabel(transaction.Type);
            worksheet.Cell(row, 4).Value = transaction.Category.Title;
            worksheet.Cell(row, 5).Value = transaction.Amount;
        }

        var headerRange = worksheet.Range(1, 1, 1, headers.Length);
        headerRange.Style.Font.Bold = true;
        headerRange.Style.Font.FontColor = XLColor.White;
        headerRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#047857");
        worksheet.Column(1).Style.DateFormat.Format = "dd/mm/yyyy";
        worksheet.Column(5).Style.NumberFormat.Format = "R$ #,##0.00;[Red]-R$ #,##0.00";
        worksheet.SheetView.FreezeRows(1);
        worksheet.RangeUsed()?.SetAutoFilter();
        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    private static string TypeLabel(ETransactionType type) => type switch
    {
        ETransactionType.Deposit => "Receita",
        ETransactionType.Withdraw => "Despesa",
        ETransactionType.Saving => "Reserva",
        _ => "Transação"
    };
}
