export interface FinancialSummary {
  income: number;
  expenses: number;
  balance: number;
  transactionCount: number;
}

export interface MonthlyFinancialData {
  month: string;
  income: number;
  expenses: number;
}
