import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PagedResponse } from '../models/category.models';
import {
  ExpenseByCategory,
  FinancialSummary,
  MonthlyFinancialData
} from '../models/financial-report.models';
import { Transaction } from '../models/transaction.models';
import { FinancialAccountService } from './financial-account.service';

@Injectable({ providedIn: 'root' })
export class FinancialReportService {
  private readonly reportsUrl = `${environment.apiBaseUrl}/v1/financial-reports`;
  private readonly transactionsUrl = `${environment.apiBaseUrl}/v1/transactions`;

  constructor(
    private readonly http: HttpClient,
    private readonly financialAccountService: FinancialAccountService
  ) {}

  getCurrentMonthSummary(): Observable<FinancialSummary> {
    const { startDate, endDate } = currentMonthPeriod();
    const periodParams = { startDate, endDate };

    return forkJoin({
      income: this.http.get<number>(`${this.reportsUrl}/total-income`, {
        params: periodParams
      }),
      expenses: this.http.get<number>(`${this.reportsUrl}/total-expenses`, {
        params: periodParams
      }),
      account: this.financialAccountService.getSummary(),
      transactions: this.http.get<PagedResponse<Transaction[]>>(this.transactionsUrl, {
        params: { ...periodParams, pageNumber: 1, pageSize: 1 }
      })
    }).pipe(
      map(({ income, expenses, account, transactions }) => ({
        income,
        expenses,
        availableBalance: account.availableBalance,
        historicalResult: account.historicalResult,
        savingsBalance: account.savingsBalance,
        accountIsReconciled: account.isReconciled,
        transactionCount: transactions.totalCount
      }))
    );
  }

  getLastSixMonths(): Observable<MonthlyFinancialData[]> {
    return this.http.get<MonthlyFinancialData[]>(`${this.reportsUrl}/by-month`, {
      params: { months: 6 }
    });
  }

  getCurrentMonthExpensesByCategory(): Observable<ExpenseByCategory[]> {
    const { startDate, endDate } = currentMonthPeriod();
    return this.http.get<ExpenseByCategory[]>(
      `${this.reportsUrl}/expenses-by-category`,
      { params: { startDate, endDate } }
    );
  }
}

function currentMonthPeriod(): { startDate: string; endDate: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  return {
    startDate: toLocalDateTime(start),
    endDate: toLocalDateTime(end)
  };
}

function toLocalDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
}
