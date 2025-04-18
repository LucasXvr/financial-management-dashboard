using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Fin.Core.Models;
using Fin.Core.Requests.Transactions;
using Fin.Core.Responses;

namespace Fin.Core.Handlers
{
    public interface ITransactionHandler
    {
        Task<Response<Transaction?>> CreateAsync(CreateTransactionRequest request);
        Task<Response<Transaction?>> UpdateAsync(UpdateTransactionRequest request);
        Task<Response<Transaction?>> DeleteAsync(DeleteTransactionRequest request);
        Task<Response<Transaction?>> GetByIdAsync(GetTransactionByIdRequest request);
        Task<PagedResponse<List<Transaction>?>> GetByPeriodAsync(GetTransactionsByPeriodRequest request);
        Task<decimal> GetCurrentBalance();
        Task<decimal> GetTotalIncomeByPeriod(DateTime start, DateTime end);
        Task<decimal> GetTotalExpensesByPeriod(DateTime start, DateTime end);
        Task<decimal> GetSavingsByPeriod(DateTime start, DateTime end);
        Task<List<BalanceOverTimeDTO>> GetBalanceOverTime(int months);
        Task<List<ExpensesByCategoryDTO>> GetExpensesByCategory(DateTime start, DateTime end);
        Task<List<TransactionsByMonthDTO>> GetTransactionsByMonth(int months);
    }
}