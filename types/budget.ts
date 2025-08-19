export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'expense' | 'income';
  isPlanned?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget?: number;
}

export interface Wallet {
  totalBalance: number;
  monthlyBudget: number;
  currency: string;
}

export interface MonthlyData {
  month: string;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  transactions: Transaction[];
}

export interface Settings {
  currency: string;
  notifications: boolean;
  budgetWarningThreshold: number;
}
