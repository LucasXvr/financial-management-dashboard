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
        Task<decimal> GetCurrentBalance(string userId);
        Task<decimal> GetTotalIncomeByPeriod(string userId, DateTime start, DateTime end);
        Task<decimal> GetTotalExpensesByPeriod(string userId, DateTime start, DateTime end);
        Task<decimal> GetSavingsByPeriod(string userId, DateTime start, DateTime end);
        Task<List<BalanceOverTimeDTO>> GetBalanceOverTime(string userId, int months);
        Task<List<ExpensesByCategoryDTO>> GetExpensesByCategory(string userId, DateTime start, DateTime end);
        Task<List<TransactionsByMonthDTO>> GetTransactionsByMonth(string userId, int months);
    }
}