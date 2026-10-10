import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';

import {
  ExpenseByCategory,
  FinancialSummary,
  MonthlyFinancialData
} from '../../core/models/financial-report.models';
import { FinancialReportService } from '../../core/services/financial-report.service';
import { FinancialAccountService } from '../../core/services/financial-account.service';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  it('renders the financial totals returned by the API', async () => {
    const fixture = await createDashboard(of({
      income: 1250.50,
      expenses: 200.25,
      availableBalance: 850.25,
      historicalResult: 1050.25,
      savingsBalance: 200,
      accountIsReconciled: true,
      transactionCount: 3
    }));
    const text = ((fixture.nativeElement as HTMLElement).textContent ?? '')
      .replace(/\s/g, ' ');

    expect(text).toContain('R$ 1.250,50');
    expect(text).toContain('R$ 200,25');
    expect(text).toContain('R$ 1.050,25');
    expect(text).toContain('R$ 850,25');
    expect(text).toContain('Disponível em conta');
    expect(text).toContain('Reservas');
    expect(text).toContain('Todo o histórico');
  });

  it('shows the empty state when the current month has no transactions', async () => {
    const fixture = await createDashboard(of({
      income: 0,
      expenses: 0,
      availableBalance: 0,
      historicalResult: 0,
      savingsBalance: 0,
      accountIsReconciled: false,
      transactionCount: 0
    }));

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Nenhuma transação registrada no mês atual. O dinheiro em conta continua considerando todo o histórico.'
    );
  });

  it('shows an error state when financial reports cannot be loaded', async () => {
    const fixture = await createDashboard(
      throwError(() => new Error('API indisponível'))
    );

    expect((fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')
      ?.textContent).toContain('Não foi possível carregar os dados financeiros.');
  });

  it('renders six monthly income, expense and savings values, including zero months', async () => {
    const fixture = await createDashboard(
      of(summary(500, 123.45, 376.55, 2)),
      of(KNOWN_MONTHS)
    );
    const text = ((fixture.nativeElement as HTMLElement).textContent ?? '')
      .replace(/\s/g, ' ');

    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.month-group')).toHaveLength(6);
    expect(text).toContain('R$ 1.000,00');
    expect(text).toContain('R$ 100,00');
    expect(text).toContain('R$ 0,00');
    expect(text).toContain('R$ 123,45');
    expect(text).toContain('R$ 716,26');
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.savings-bar')).toHaveLength(6);
  });

  it('shows an empty state when all six months have zero values', async () => {
    const zeroMonths = KNOWN_MONTHS.map((item) => ({
      ...item,
      income: 0,
      expenses: 0,
      savings: 0
    }));
    const fixture = await createDashboard(
      of(summary(0, 0, 0, 0)),
      of(zeroMonths)
    );

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Nenhuma receita, despesa ou reserva registrada nos últimos 6 meses.'
    );
  });

  it('shows a chart error without hiding the financial cards', async () => {
    const fixture = await createDashboard(
      of(summary(500, 100, 400, 2)),
      throwError(() => new Error('Relatório indisponível'))
    );
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('R$');
    expect(element.textContent).toContain('Não foi possível carregar receitas e despesas mensais.');
  });

  it('renders current-month expenses by category with values and percentages', async () => {
    const fixture = await createDashboard(
      of(summary(500, 200, 300, 2)),
      of(KNOWN_MONTHS),
      of([
        { category: 'Casa', amount: 2641.52 },
        { category: 'Assinaturas', amount: 72.25 }
      ])
    );
    const text = ((fixture.nativeElement as HTMLElement).textContent ?? '').replace(/\s/g, ' ');

    expect(text).toContain('Despesas por categoria');
    expect(text).toContain('Casa');
    expect(text).toContain('R$ 2.641,52');
    expect(text).toContain('97,3%');
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.category-row')).toHaveLength(2);
  });

  it('shows an independent empty state when there are no category expenses', async () => {
    const fixture = await createDashboard(
      of(summary(500, 0, 500, 1)),
      of(KNOWN_MONTHS),
      of([])
    );

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Nenhuma despesa registrada no mês atual.'
    );
  });

  it('reconciles the account with a Brazilian currency value', async () => {
    const reconcile = vi.fn().mockReturnValue(of({
      name: 'Conta principal',
      availableBalance: 1874.02,
      historicalResult: 4117.51,
      savingsBalance: 1016.26,
      isReconciled: true
    }));
    const fixture = await createDashboard(
      of(summary(5559.87, 3432.19, 3101.25, 11)),
      of(KNOWN_MONTHS),
      of([]),
      reconcile
    );
    const element = fixture.nativeElement as HTMLElement;

    (element.querySelector('.balance-action') as HTMLButtonElement).click();
    fixture.detectChanges();
    const input = element.querySelector('#current-balance') as HTMLInputElement;
    input.value = '1.874,02';
    input.dispatchEvent(new Event('input'));
    (element.querySelector('.balance-form') as HTMLFormElement)
      .dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(reconcile).toHaveBeenCalledWith(1874.02);
    expect(element.textContent?.replace(/\s/g, ' ')).toContain('R$ 1.874,02');
    expect(element.textContent).toContain('Saldo da conta atualizado com sucesso.');
  });
});

async function createDashboard(
  response: Observable<FinancialSummary>,
  monthlyResponse: Observable<MonthlyFinancialData[]> = of(KNOWN_MONTHS),
  categoryResponse: Observable<ExpenseByCategory[]> = of([]),
  reconcile: (balance: number) => Observable<unknown> = () => of({
    name: 'Conta principal',
    availableBalance: 1874.02,
    historicalResult: 4117.51,
    savingsBalance: 1016.26,
    isReconciled: true
  })
): Promise<ComponentFixture<DashboardComponent>> {
  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [DashboardComponent],
    providers: [{
      provide: FinancialReportService,
      useValue: {
        getCurrentMonthSummary: () => response,
        getLastSixMonths: () => monthlyResponse,
        getCurrentMonthExpensesByCategory: () => categoryResponse
      }
    }, {
      provide: FinancialAccountService,
      useValue: {
        reconcile
      }
    }]
  }).compileComponents();

  const fixture = TestBed.createComponent(DashboardComponent);
  fixture.detectChanges();
  return fixture;
}

function summary(
  income: number,
  expenses: number,
  availableBalance: number,
  transactionCount: number
): FinancialSummary {
  return {
    income,
    expenses,
    availableBalance,
    historicalResult: availableBalance,
    savingsBalance: 0,
    accountIsReconciled: true,
    transactionCount
  };
}

const KNOWN_MONTHS: MonthlyFinancialData[] = [
  { month: 'abr.', income: 1000, expenses: 100, savings: 0 },
  { month: 'mai.', income: 0, expenses: 0, savings: 0 },
  { month: 'jun.', income: 0, expenses: 50, savings: 0 },
  { month: 'jul.', income: 250.50, expenses: 0, savings: 0 },
  { month: 'ago.', income: 0, expenses: 0, savings: 0 },
  { month: 'set.', income: 500, expenses: 123.45, savings: 716.26 }
];
