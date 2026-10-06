import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

import { extractApiMessage } from '../../core/models/auth-api.models';
import { Category } from '../../core/models/category.models';
import {
  Transaction,
  TransactionType
} from '../../core/models/transaction.models';
import { CategoryService } from '../../core/services/category.service';
import { TransactionService } from '../../core/services/transaction.service';

@Component({
  selector: 'app-transactions',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent implements OnInit {
  protected transactions: Transaction[] = [];
  protected categories: Category[] = [];
  protected loading = true;
  protected categoriesLoading = true;
  protected saving = false;
  protected loadError = '';
  protected categoriesError = '';
  protected formError = '';
  protected successMessage = '';
  protected currentPage = 1;
  protected totalPages = 0;
  protected totalCount = 0;
  protected editingTransaction: Transaction | null = null;
  protected transactionPendingDeletion: Transaction | null = null;
  protected deleting = false;
  protected deleteError = '';
  protected exporting = false;
  protected exportError = '';
  protected readonly pageSize = 10;
  protected readonly transactionTypes = [
    { value: TransactionType.Deposit, label: 'Receita' },
    { value: TransactionType.Withdraw, label: 'Despesa' },
    { value: TransactionType.Saving, label: 'Reserva' }
  ];
  protected readonly transactionForm;
  protected readonly filterForm;

  private readonly currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  });
  private readonly dateFormatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC'
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly categoryService: CategoryService,
    private readonly transactionService: TransactionService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {
    this.transactionForm = this.formBuilder.nonNullable.group({
      title: ['', [Validators.required, Validators.maxLength(80)]],
      type: [TransactionType.Withdraw, Validators.required],
      amount: ['', [Validators.required, currencyValidator]],
      categoryId: [0, [Validators.required, Validators.min(1)]],
      paidOrReceivedAt: [
        todayForInput(),
        [Validators.required, futureDateValidator]
      ]
    });
    this.filterForm = this.formBuilder.nonNullable.group({
      startDate: ['2000-01-01', Validators.required],
      endDate: ['2100-12-31', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadTransactions();
  }

  protected loadTransactions(pageNumber = this.currentPage): void {
    this.loading = true;
    this.loadError = '';
    this.changeDetectorRef.markForCheck();

    const period = this.filterForm.getRawValue();
    if (period.startDate > period.endDate) {
      this.loadError = 'A data inicial deve ser anterior ou igual à data final.';
      this.loading = false;
      this.changeDetectorRef.markForCheck();
      return;
    }

    this.transactionService.getTransactions(
      pageNumber,
      this.pageSize,
      period.startDate,
      period.endDate
    ).subscribe({
      next: (response) => {
        this.transactions = response.data ?? [];
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.totalCount = response.totalCount;
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      },
      error: (error: unknown) => {
        this.loadError = this.getErrorMessage(
          error,
          'Não foi possível carregar as transações.'
        );
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  protected applyFilters(): void {
    this.exportError = '';
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      return;
    }
    this.loadTransactions(1);
  }

  protected clearFilters(): void {
    this.filterForm.reset({ startDate: '2000-01-01', endDate: '2100-12-31' });
    this.exportError = '';
    this.loadTransactions(1);
  }

  protected exportTransactions(): void {
    this.exportError = '';
    if (this.filterForm.invalid || this.exporting) {
      this.filterForm.markAllAsTouched();
      return;
    }

    const period = this.filterForm.getRawValue();
    if (period.startDate > period.endDate) {
      this.exportError = 'A data inicial deve ser anterior ou igual à data final.';
      return;
    }

    this.exporting = true;
    this.changeDetectorRef.markForCheck();
    this.transactionService.exportTransactions(period.startDate, period.endDate).subscribe({
      next: (file) => {
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = `transacoes-${period.startDate}-a-${period.endDate}.xlsx`;
        link.click();
        URL.revokeObjectURL(url);
        this.exporting = false;
        this.changeDetectorRef.markForCheck();
      },
      error: (error: unknown) => {
        this.exportError = this.getErrorMessage(
          error,
          'Não foi possível exportar as transações.'
        );
        this.exporting = false;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  protected loadCategories(): void {
    this.categoriesLoading = true;
    this.categoriesError = '';
    this.changeDetectorRef.markForCheck();

    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.categoriesLoading = false;
        this.changeDetectorRef.markForCheck();
      },
      error: (error: unknown) => {
        this.categoriesError = this.getErrorMessage(
          error,
          'Não foi possível carregar as categorias.'
        );
        this.categoriesLoading = false;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  protected submit(): void {
    this.formError = '';
    this.successMessage = '';

    if (this.transactionForm.invalid || this.saving || this.categoriesLoading) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    const values = this.transactionForm.getRawValue();
    const amountInCents = parseCurrencyToCents(values.amount);
    if (amountInCents === null || amountInCents <= 0) {
      this.transactionForm.controls.amount.setErrors({ currency: true });
      return;
    }

    this.saving = true;
    const payload = {
      title: values.title.trim(),
      type: Number(values.type) as TransactionType,
      amount: amountInCents / 100,
      categoryId: Number(values.categoryId),
      paidOrReceivedAt: `${values.paidOrReceivedAt}T12:00:00`
    };
    const wasEditing = this.editingTransaction !== null;
    const operation = this.editingTransaction
      ? this.transactionService.updateTransaction(this.editingTransaction.id, payload)
      : this.transactionService.createTransaction(payload);

    operation.subscribe({
      next: () => {
        const targetPage = wasEditing
          ? this.currentPage
          : Math.floor(this.totalCount / this.pageSize) + 1;
        this.resetForm();
        this.successMessage = wasEditing
          ? 'Transação atualizada com sucesso.'
          : 'Transação cadastrada com sucesso.';
        this.saving = false;
        this.changeDetectorRef.markForCheck();
        this.loadTransactions(targetPage);
      },
      error: (error: unknown) => {
        this.formError = this.getErrorMessage(
          error,
          wasEditing
            ? 'Não foi possível atualizar a transação.'
            : 'Não foi possível cadastrar a transação.'
        );
        this.saving = false;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  protected startEditing(transaction: Transaction): void {
    this.editingTransaction = transaction;
    this.formError = '';
    this.successMessage = '';
    this.transactionForm.setValue({
      title: transaction.title,
      type: transaction.type,
      amount: Math.abs(transaction.amount).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }),
      categoryId: transaction.categoryId,
      paidOrReceivedAt: transaction.paidOrReceivedAt?.slice(0, 10) ?? todayForInput()
    });
    this.changeDetectorRef.markForCheck();
  }

  protected cancelEditing(): void {
    if (this.saving) return;
    this.resetForm();
    this.formError = '';
  }

  protected requestDeletion(transaction: Transaction): void {
    this.transactionPendingDeletion = transaction;
    this.deleteError = '';
  }

  protected cancelDeletion(): void {
    if (this.deleting) return;
    this.transactionPendingDeletion = null;
    this.deleteError = '';
  }

  protected confirmDeletion(): void {
    const transaction = this.transactionPendingDeletion;
    if (!transaction || this.deleting) return;

    this.deleting = true;
    this.deleteError = '';
    this.transactionService.deleteTransaction(transaction.id).subscribe({
      next: () => {
        const targetPage = this.transactions.length === 1 && this.currentPage > 1
          ? this.currentPage - 1
          : this.currentPage;

        if (this.editingTransaction?.id === transaction.id) {
          this.resetForm();
        }
        this.transactionPendingDeletion = null;
        this.deleting = false;
        this.successMessage = 'Transação excluída com sucesso.';
        this.changeDetectorRef.markForCheck();
        this.loadTransactions(targetPage);
      },
      error: (error: unknown) => {
        this.deleteError = this.getErrorMessage(
          error,
          'Não foi possível excluir a transação.'
        );
        this.deleting = false;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  protected formatAmount(): void {
    const amountInCents = parseCurrencyToCents(this.transactionForm.controls.amount.value);
    if (amountInCents === null) return;

    this.transactionForm.controls.amount.setValue(
      (amountInCents / 100).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    );
  }

  protected categoryTitle(categoryId: number): string {
    return this.categories.find((category) => category.id === categoryId)?.title
      ?? 'Categoria não disponível';
  }

  protected typeLabel(type: TransactionType): string {
    return this.transactionTypes.find((item) => item.value === type)?.label
      ?? 'Transação';
  }

  protected formatCurrency(amount: number): string {
    return this.currencyFormatter.format(amount);
  }

  protected formatDate(date: string | null): string {
    if (!date) return 'Sem data';
    return this.dateFormatter.format(new Date(date));
  }

  protected previousPage(): void {
    if (!this.loading && this.currentPage > 1) {
      this.loadTransactions(this.currentPage - 1);
    }
  }

  protected nextPage(): void {
    if (!this.loading && this.currentPage < this.totalPages) {
      this.loadTransactions(this.currentPage + 1);
    }
  }

  private resetForm(): void {
    this.editingTransaction = null;
    this.transactionForm.reset({
      title: '',
      type: TransactionType.Withdraw,
      amount: '',
      categoryId: 0,
      paidOrReceivedAt: todayForInput()
    });
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      return extractApiMessage(error.error, fallback);
    }

    return error instanceof Error ? error.message : fallback;
  }
}

function currencyValidator(control: AbstractControl<string>): ValidationErrors | null {
  const amountInCents = parseCurrencyToCents(control.value);
  return amountInCents !== null && amountInCents > 0 ? null : { currency: true };
}

function futureDateValidator(
  control: AbstractControl<string>
): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  return value > todayForInput() ? { futureDate: true } : null;
}

function parseCurrencyToCents(value: string): number | null {
  const sanitized = value.trim().replace(/R\$\s?/gi, '').replace(/\s/g, '');
  if (!sanitized) return null;

  let normalized = sanitized;
  if (sanitized.includes(',')) {
    normalized = sanitized.replace(/\./g, '').replace(',', '.');
  } else if ((sanitized.match(/\./g) ?? []).length > 1) {
    normalized = sanitized.replace(/\./g, '');
  }

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;

  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount > 999_999_999_999) return null;
  return Math.round(amount * 100);
}

function todayForInput(): string {
  const today = new Date();
  const offset = today.getTimezoneOffset() * 60_000;
  return new Date(today.getTime() - offset).toISOString().slice(0, 10);
}
