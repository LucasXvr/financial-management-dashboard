import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import {
  ExpenseByCategory,
  FinancialSummary,
  MonthlyFinancialData
} from '../../core/models/financial-report.models';
import { FinancialReportService } from '../../core/services/financial-report.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  protected summary: FinancialSummary | null = null;
  protected loading = true;
  protected errorMessage = '';
  protected monthlyData: MonthlyFinancialData[] = [];
  protected chartLoading = true;
  protected chartError = '';
  protected categoryExpenses: ExpenseByCategory[] = [];
  protected categoryExpensesLoading = true;
  protected categoryExpensesError = '';

  private readonly currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  });
  private readonly percentageFormatter = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });

  constructor(
    private readonly financialReportService: FinancialReportService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSummary();
    this.loadMonthlyReport();
    this.loadCategoryExpenses();
  }

  protected loadCategoryExpenses(): void {
    this.categoryExpensesLoading = true;
    this.categoryExpensesError = '';
    this.changeDetectorRef.markForCheck();

    this.financialReportService.getCurrentMonthExpensesByCategory().subscribe({
      next: (expenses) => {
        this.categoryExpenses = expenses;
        this.categoryExpensesLoading = false;
        this.changeDetectorRef.markForCheck();
      },
      error: () => {
        this.categoryExpenses = [];
        this.categoryExpensesError = 'Não foi possível carregar as despesas por categoria.';
        this.categoryExpensesLoading = false;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  protected loadMonthlyReport(): void {
    this.chartLoading = true;
    this.chartError = '';
    this.changeDetectorRef.markForCheck();

    this.financialReportService.getLastSixMonths().subscribe({
      next: (monthlyData) => {
        this.monthlyData = monthlyData;
        this.chartLoading = false;
        this.changeDetectorRef.markForCheck();
      },
      error: () => {
        this.monthlyData = [];
        this.chartError = 'Não foi possível carregar receitas e despesas mensais.';
        this.chartLoading = false;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  protected get chartIsEmpty(): boolean {
    return this.monthlyData.length === 0 || this.monthlyData.every(
      (item) => item.income === 0 && item.expenses === 0 && item.savings === 0
    );
  }

  protected barHeight(value: number): number {
    const maximum = this.chartMaximum;
    if (value === 0 || maximum === 0) return 0;
    return Math.max(6, (value / maximum) * 100);
  }

  protected get chartScale(): number[] {
    const maximum = this.chartMaximum;
    return [maximum, maximum * 0.75, maximum * 0.5, maximum * 0.25, 0];
  }

  protected categoryBarWidth(amount: number): number {
    const maximum = Math.max(0, ...this.categoryExpenses.map((item) => item.amount));
    return maximum === 0 ? 0 : (amount / maximum) * 100;
  }

  protected categoryPercentage(amount: number): number {
    const total = this.categoryExpenses.reduce((sum, item) => sum + item.amount, 0);
    return total === 0 ? 0 : (amount / total) * 100;
  }

  private get chartMaximum(): number {
    return Math.max(
      0,
      ...this.monthlyData.flatMap((item) => [item.income, item.expenses, item.savings])
    );
  }

  protected loadSummary(): void {
    this.loading = true;
    this.errorMessage = '';
    this.changeDetectorRef.markForCheck();

    this.financialReportService.getCurrentMonthSummary().subscribe({
      next: (summary) => {
        this.summary = summary;
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      },
      error: () => {
        this.summary = null;
        this.errorMessage = 'Não foi possível carregar os dados financeiros.';
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  protected formatCurrency(value: number): string {
    return this.currencyFormatter.format(value);
  }

  protected formatCompactCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  }

  protected formatPercentage(value: number): string {
    return `${this.percentageFormatter.format(value)}%`;
  }
}
