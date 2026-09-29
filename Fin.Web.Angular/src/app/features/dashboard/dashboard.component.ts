import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import {
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

  private readonly currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  });

  constructor(
    private readonly financialReportService: FinancialReportService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSummary();
    this.loadMonthlyReport();
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
      (item) => item.income === 0 && item.expenses === 0
    );
  }

  protected barHeight(value: number): number {
    const maximum = Math.max(
      0,
      ...this.monthlyData.flatMap((item) => [item.income, item.expenses])
    );
    if (value === 0 || maximum === 0) return 0;
    return Math.max(6, (value / maximum) * 100);
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
}
