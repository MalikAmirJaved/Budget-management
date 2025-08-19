import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { DEFAULT_CATEGORIES } from '@/constants/categories';
import { Category, MonthlyData, Settings, Transaction, Wallet } from '@/types/budget';

const STORAGE_KEYS = {
  TRANSACTIONS: 'budget_transactions',
  WALLET: 'budget_wallet',
  CATEGORIES: 'budget_categories',
  SETTINGS: 'budget_settings',
};

export const [BudgetProvider, useBudget] = createContextHook(() => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallet, setWallet] = useState<Wallet>({
    totalBalance: 0,
    monthlyBudget: 0,
    currency: 'USD',
  });
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [settings, setSettings] = useState<Settings>({
    currency: 'USD',
    notifications: true,
    budgetWarningThreshold: 80,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load data from AsyncStorage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedTransactions, storedWallet, storedCategories, storedSettings] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS),
        AsyncStorage.getItem(STORAGE_KEYS.WALLET),
        AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES),
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
      ]);

      if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
      if (storedWallet) setWallet(JSON.parse(storedWallet));
      if (storedCategories) setCategories(JSON.parse(storedCategories));
      if (storedSettings) setSettings(JSON.parse(storedSettings));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTransactions = async (newTransactions: Transaction[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(newTransactions));
      setTransactions(newTransactions);
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  };

  const saveWallet = async (newWallet: Wallet) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(newWallet));
      setWallet(newWallet);
    } catch (error) {
      console.error('Error saving wallet:', error);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    
    const updatedTransactions = [...transactions, newTransaction];
    await saveTransactions(updatedTransactions);

    // Update wallet balance
    if (transaction.type === 'expense' && !transaction.isPlanned) {
      const newBalance = wallet.totalBalance - transaction.amount;
      await saveWallet({ ...wallet, totalBalance: newBalance });
      
      // Check budget warning
      const currentMonthExpenses = getCurrentMonthExpenses(updatedTransactions);
      const budgetUsagePercent = (currentMonthExpenses / wallet.monthlyBudget) * 100;
      
      if (settings.notifications && budgetUsagePercent >= settings.budgetWarningThreshold) {
        Alert.alert(
          '⚠️ Budget Warning',
          `You've used ${budgetUsagePercent.toFixed(0)}% of your monthly budget!`,
          [{ text: 'OK' }]
        );
      }
    } else if (transaction.type === 'income' && !transaction.isPlanned) {
      const newBalance = wallet.totalBalance + transaction.amount;
      await saveWallet({ ...wallet, totalBalance: newBalance });
    }
  };

  const deleteTransaction = async (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    const updatedTransactions = transactions.filter(t => t.id !== id);
    await saveTransactions(updatedTransactions);

    // Revert wallet balance if not planned
    if (!transaction.isPlanned) {
      const balanceChange = transaction.type === 'expense' 
        ? transaction.amount 
        : -transaction.amount;
      const newBalance = wallet.totalBalance + balanceChange;
      await saveWallet({ ...wallet, totalBalance: newBalance });
    }
  };

  const getCurrentMonthExpenses = (txns: Transaction[] = transactions): number => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return txns
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' && 
               !t.isPlanned &&
               date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getCurrentMonthIncome = (): number => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'income' && 
               !t.isPlanned &&
               date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getPlannedTransactions = (): Transaction[] => {
    return transactions.filter(t => t.isPlanned);
  };

  const getTransactionsByCategory = (categoryId: string): Transaction[] => {
    return transactions.filter(t => t.category === categoryId && !t.isPlanned);
  };

  const getMonthlyData = (month: number, year: number): MonthlyData => {
    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === month && 
             date.getFullYear() === year &&
             !t.isPlanned;
    });

    const totalIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      month: new Date(year, month).toLocaleString('default', { month: 'long' }),
      year,
      totalIncome,
      totalExpenses,
      transactions: monthTransactions,
    };
  };

  return {
    transactions,
    wallet,
    categories,
    settings,
    isLoading,
    addTransaction,
    deleteTransaction,
    saveWallet,
    saveSettings,
    getCurrentMonthExpenses,
    getCurrentMonthIncome,
    getPlannedTransactions,
    getTransactionsByCategory,
    getMonthlyData,
  };
});
