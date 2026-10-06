import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { CategoryService } from '../../core/services/category.service';
import {
  CreateTransactionRequest,
  TransactionType
} from '../../core/models/transaction.models';
import { TransactionService } from '../../core/services/transaction.service';
import { TransactionsComponent } from './transactions.component';

describe('TransactionsComponent', () => {
  let fixture: ComponentFixture<TransactionsComponent>;
  let transactionService: TransactionServiceMock;

  beforeEach(async () => {
    transactionService = new TransactionServiceMock();

    await TestBed.configureTestingModule({
      imports: [TransactionsComponent],
      providers: [
        {
          provide: CategoryService,
          useValue: {
            getAllCategories: () => of([
              { id: 7, title: 'Alimentação', description: 'Compras e refeições' }
            ])
          }
        },
        { provide: TransactionService, useValue: transactionService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionsComponent);
    fixture.detectChanges();
  });

  it('shows amount, date and category in the transaction list', () => {
    const element = fixture.nativeElement as HTMLElement;
    const content = element.querySelector('.transaction-content')?.textContent ?? '';

    expect(content).toContain('Compra do mês');
    expect(content).toContain('R$');
    expect(content).toContain('1.234,56');
    expect(content).toContain('Alimentação');
    expect(content).toContain('15/09/2026');
  });

  it('sends Brazilian currency values without losing cents', () => {
    const component = fixture.componentInstance as unknown as {
      transactionForm: {
        setValue(value: Record<string, unknown>): void;
      };
      submit(): void;
    };

    component.transactionForm.setValue({
      title: 'Pagamento de teste',
      type: TransactionType.Deposit,
      amount: '1.234,56',
      categoryId: 7,
      paidOrReceivedAt: '2026-09-20'
    });
    component.submit();

    expect(transactionService.lastCreatedPayload).toEqual({
      title: 'Pagamento de teste',
      type: TransactionType.Deposit,
      amount: 1234.56,
      categoryId: 7,
      paidOrReceivedAt: '2026-09-20T12:00:00'
    });
  });

  it('accepts past and current dates but rejects a future civil date', () => {
    const dateControl = getDateControl(fixture.componentInstance);

    dateControl.setValue(dateForInput(-1));
    expect(dateControl.valid).toBe(true);

    dateControl.setValue(dateForInput(0));
    expect(dateControl.valid).toBe(true);

    dateControl.setValue(dateForInput(1));
    dateControl.markAsTouched();
    fixture.detectChanges();

    expect(dateControl.hasError('futureDate')).toBe(true);
    expect((fixture.nativeElement as HTMLElement).textContent)
      .toContain('A data da transação não pode ser futura.');
  });

  it('keeps the required validation responsible for an empty date', () => {
    const dateControl = getDateControl(fixture.componentInstance);

    dateControl.setValue('');

    expect(dateControl.hasError('required')).toBe(true);
    expect(dateControl.hasError('futureDate')).toBe(false);
  });

  it('edits a negative expense as a positive amount without inverting it twice', () => {
    const component = fixture.componentInstance as unknown as {
      transactionForm: { value: { amount: string } };
      startEditing(transaction: unknown): void;
      submit(): void;
    };

    component.startEditing(transactionService.transaction);

    expect(component.transactionForm.value.amount).toBe('1.234,56');
    component.submit();

    expect(transactionService.lastUpdatedId).toBe(10);
    expect(transactionService.lastUpdatedPayload?.amount).toBe(1234.56);
    expect(transactionService.lastUpdatedPayload?.type).toBe(TransactionType.Withdraw);
  });

  it('returns to the previous page when deleting its last item', () => {
    const component = fixture.componentInstance as unknown as {
      transactions: unknown[];
      currentPage: number;
      requestDeletion(transaction: unknown): void;
      confirmDeletion(): void;
    };
    component.transactions = [transactionService.transaction];
    component.currentPage = 2;

    component.requestDeletion(transactionService.transaction);
    expect((component as unknown as { transactionPendingDeletion: unknown })
      .transactionPendingDeletion).toBe(transactionService.transaction);

    component.confirmDeletion();

    expect(transactionService.lastDeletedId).toBe(10);
    expect(transactionService.requestedPages.at(-1)).toBe(1);
  });

  it('uses the selected period for the list and Excel export', () => {
    const component = fixture.componentInstance as unknown as {
      filterForm: { setValue(value: Record<string, string>): void };
      applyFilters(): void;
      exportTransactions(): void;
    };
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: () => 'blob:transactions'
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: () => undefined
    });
    const originalClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = () => undefined;

    component.filterForm.setValue({
      startDate: '2026-09-01',
      endDate: '2026-09-30'
    });
    component.applyFilters();
    component.exportTransactions();

    expect(transactionService.lastRequestedPeriod).toEqual({
      startDate: '2026-09-01',
      endDate: '2026-09-30'
    });
    expect(transactionService.lastExportedPeriod).toEqual({
      startDate: '2026-09-01',
      endDate: '2026-09-30'
    });
    HTMLAnchorElement.prototype.click = originalClick;
  });

  it('shows an error and releases the button when Excel export fails', () => {
    transactionService.failExport = true;
    const component = fixture.componentInstance as unknown as {
      exportTransactions(): void;
      exporting: boolean;
    };

    component.exportTransactions();
    fixture.detectChanges();

    expect(component.exporting).toBe(false);
    expect((fixture.nativeElement as HTMLElement).textContent)
      .toContain('Falha simulada na exportação.');
  });
});

class TransactionServiceMock {
  lastCreatedPayload: CreateTransactionRequest | null = null;
  lastUpdatedId: number | null = null;
  lastUpdatedPayload: CreateTransactionRequest | null = null;
  lastDeletedId: number | null = null;
  requestedPages: number[] = [];
  lastRequestedPeriod: { startDate: string; endDate: string } | null = null;
  lastExportedPeriod: { startDate: string; endDate: string } | null = null;
  failExport = false;
  readonly transaction = {
    id: 10,
    title: 'Compra do mês',
    createdAt: '2026-09-15T12:00:00',
    paidOrReceivedAt: '2026-09-15T12:00:00',
    type: TransactionType.Withdraw,
    amount: -1234.56,
    categoryId: 7,
    category: null,
    isSavings: false
  };

  getTransactions(
    pageNumber = 1,
    _pageSize = 10,
    startDate = '2000-01-01',
    endDate = '2100-12-31'
  ) {
    this.requestedPages.push(pageNumber);
    this.lastRequestedPeriod = { startDate, endDate };
    return of({
      data: [this.transaction],
      currentPage: pageNumber,
      totalPages: 1,
      pageSize: 10,
      totalCount: 1
    });
  }

  exportTransactions(startDate: string, endDate: string) {
    this.lastExportedPeriod = { startDate, endDate };
    if (this.failExport)
      return throwError(() => new Error('Falha simulada na exportação.'));
    return of(new Blob(['xlsx'], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }));
  }

  createTransaction(payload: CreateTransactionRequest) {
    this.lastCreatedPayload = payload;
    return of({
      id: 11,
      createdAt: '2026-09-20T12:00:00',
      isSavings: false,
      ...payload
    });
  }

  updateTransaction(id: number, payload: CreateTransactionRequest) {
    this.lastUpdatedId = id;
    this.lastUpdatedPayload = payload;
    return of({
      ...this.transaction,
      ...payload,
      amount: payload.type === TransactionType.Withdraw
        ? -Math.abs(payload.amount)
        : Math.abs(payload.amount)
    });
  }

  deleteTransaction(id: number) {
    this.lastDeletedId = id;
    return of(void 0);
  }
}

function dateForInput(dayOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function getDateControl(component: TransactionsComponent): FormControl<string> {
  return (component as unknown as {
    transactionForm: { controls: { paidOrReceivedAt: FormControl<string> } };
  }).transactionForm.controls.paidOrReceivedAt;
}
