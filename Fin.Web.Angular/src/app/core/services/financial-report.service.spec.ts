import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { FinancialSummary } from '../models/financial-report.models';
import { FinancialReportService } from './financial-report.service';

describe('FinancialReportService', () => {
  let service: FinancialReportService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FinancialReportService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(FinancialReportService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('uses exactly the same current-month interval for totals and transactions', () => {
    let summary: FinancialSummary | undefined;
    service.getCurrentMonthSummary().subscribe((value) => summary = value);

    const income = httpTesting.expectOne((request) =>
      request.url.endsWith('/v1/financial-reports/total-income'));
    const expenses = httpTesting.expectOne((request) =>
      request.url.endsWith('/v1/financial-reports/total-expenses'));
    const account = httpTesting.expectOne((request) =>
      request.url.endsWith('/v1/accounts/default'));
    const transactions = httpTesting.expectOne((request) =>
      request.url.endsWith('/v1/transactions'));

    const startDate = income.request.params.get('startDate');
    const endDate = income.request.params.get('endDate');
    expect(expenses.request.params.get('startDate')).toBe(startDate);
    expect(expenses.request.params.get('endDate')).toBe(endDate);
    expect(transactions.request.params.get('startDate')).toBe(startDate);
    expect(transactions.request.params.get('endDate')).toBe(endDate);
    expect(startDate).toMatch(/-01T00:00:00\.000$/);
    expect(endDate).toMatch(/T23:59:59\.999$/);
    expect(account.request.params.has('startDate')).toBe(false);
    expect(account.request.params.has('endDate')).toBe(false);

    income.flush(1250.50);
    expenses.flush(200.25);
    account.flush({
      name: 'Conta principal',
      availableBalance: 850.25,
      historicalResult: 1050.25,
      savingsBalance: 200,
      isReconciled: true
    });
    transactions.flush({
      data: [],
      currentPage: 1,
      totalPages: 1,
      pageSize: 1,
      totalCount: 3
    });

    expect(summary).toEqual({
      income: 1250.50,
      expenses: 200.25,
      availableBalance: 850.25,
      historicalResult: 1050.25,
      savingsBalance: 200,
      accountIsReconciled: true,
      transactionCount: 3
    });
  });

  it('requests six monthly entries and preserves positive expenses and zero months', () => {
    let result: unknown;
    service.getLastSixMonths().subscribe((value) => result = value);

    const request = httpTesting.expectOne((item) =>
      item.url.endsWith('/v1/financial-reports/by-month'));
    expect(request.request.params.get('months')).toBe('6');

    request.flush([
      { month: 'ago.', income: 0, expenses: 0, savings: 0 },
      { month: 'set.', income: 500, expenses: 123.45, savings: 716.26 }
    ]);

    expect(result).toEqual([
      { month: 'ago.', income: 0, expenses: 0, savings: 0 },
      { month: 'set.', income: 500, expenses: 123.45, savings: 716.26 }
    ]);
  });

  it('requests current-month expenses grouped by category', () => {
    let result: unknown;
    service.getCurrentMonthExpensesByCategory().subscribe((value) => result = value);

    const request = httpTesting.expectOne((item) =>
      item.url.endsWith('/v1/financial-reports/expenses-by-category'));
    expect(request.request.params.get('startDate')).toMatch(/-01T00:00:00\.000$/);
    expect(request.request.params.get('endDate')).toMatch(/T23:59:59\.999$/);

    request.flush([
      { category: 'Casa', amount: 2641.52 },
      { category: 'Assinaturas', amount: 72.25 }
    ]);

    expect(result).toEqual([
      { category: 'Casa', amount: 2641.52 },
      { category: 'Assinaturas', amount: 72.25 }
    ]);
  });
});
