export interface FinancialSummary {
  income: number;
  expenses: number;
  availableBalance: number;
  historicalResult: number;
  savingsBalance: number;
  accountIsReconciled: boolean;
  transactionCount: number;
}

export interface MonthlyFinancialData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface ExpenseByCategory {
  category: string;
  amount: number;
}
