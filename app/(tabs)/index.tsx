import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useBudget } from '@/hooks/budget-context';
import { CURRENCY_SYMBOLS } from '@/constants/categories';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CategoryIcon } from '@/components/CategoryIcon';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { 
    wallet, 
    transactions, 
    categories, 
    settings,
    getCurrentMonthExpenses,
    getCurrentMonthIncome,
    getTransactionsByCategory 
  } = useBudget();

  const currencySymbol = CURRENCY_SYMBOLS[settings.currency] || '$';
  const monthExpenses = getCurrentMonthExpenses();
  const monthIncome = getCurrentMonthIncome();
  const budgetUsed = wallet.monthlyBudget > 0 ? (monthExpenses / wallet.monthlyBudget) * 100 : 0;
  const budgetRemaining = wallet.monthlyBudget - monthExpenses;

  const categoryStats = useMemo(() => {
    return categories.map(category => {
      const categoryTransactions = getTransactionsByCategory(category.id);
      const total = categoryTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...category, total };
    }).filter(c => c.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [transactions, categories]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Balance Card */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.balanceCard}
      >
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>
          {currencySymbol}{wallet.totalBalance.toFixed(2)}
        </Text>
        <View style={styles.balanceRow}>
          <View style={styles.balanceItem}>
            <TrendingUp size={20} color="#4ADE80" />
            <Text style={styles.balanceItemLabel}>Income</Text>
            <Text style={styles.balanceItemValue}>
              {currencySymbol}{monthIncome.toFixed(0)}
            </Text>
          </View>
          <View style={styles.balanceDivider} />
          <View style={styles.balanceItem}>
            <TrendingDown size={20} color="#F87171" />
            <Text style={styles.balanceItemLabel}>Expenses</Text>
            <Text style={styles.balanceItemValue}>
              {currencySymbol}{monthExpenses.toFixed(0)}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Budget Overview */}
      <View style={styles.budgetCard}>
        <View style={styles.budgetHeader}>
          <Text style={styles.sectionTitle}>Monthly Budget</Text>
          <Text style={styles.budgetPercentage}>{budgetUsed.toFixed(0)}%</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { 
                width: `${Math.min(budgetUsed, 100)}%`,
                backgroundColor: budgetUsed > 100 ? '#FF6B6B' : budgetUsed > 80 ? '#FFA500' : '#00B894'
              }
            ]} 
          />
        </View>
        <View style={styles.budgetDetails}>
          <View>
            <Text style={styles.budgetLabel}>Spent</Text>
            <Text style={styles.budgetValue}>{currencySymbol}{monthExpenses.toFixed(2)}</Text>
          </View>
          <View>
            <Text style={styles.budgetLabel}>Remaining</Text>
            <Text style={[styles.budgetValue, { color: budgetRemaining < 0 ? '#FF6B6B' : '#00B894' }]}>
              {currencySymbol}{Math.abs(budgetRemaining).toFixed(2)}
            </Text>
          </View>
          <View>
            <Text style={styles.budgetLabel}>Budget</Text>
            <Text style={styles.budgetValue}>{currencySymbol}{wallet.monthlyBudget.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <DollarSign size={24} color="#4CAF50" />
          <Text style={styles.statValue}>{transactions.length}</Text>
          <Text style={styles.statLabel}>Transactions</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
          <Target size={24} color="#FF9800" />
          <Text style={styles.statValue}>
            {transactions.filter(t => t.isPlanned).length}
          </Text>
          <Text style={styles.statLabel}>Planned</Text>
        </View>
      </View>

      {/* Top Categories */}
      {categoryStats.length > 0 && (
        <View style={styles.categoriesCard}>
          <Text style={styles.sectionTitle}>Top Categories</Text>
          {categoryStats.map((category, index) => (
            <View key={category.id} style={styles.categoryItem}>
              <View style={styles.categoryLeft}>
                <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                  <CategoryIcon iconName={category.icon} color={category.color} size={20} />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </View>
              <Text style={styles.categoryAmount}>
                {currencySymbol}{category.total.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Recent Transactions */}
      <View style={styles.recentCard}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {transactions.slice(-3).reverse().map((transaction) => {
          const category = categories.find(c => c.id === transaction.category);
          return (
            <View key={transaction.id} style={styles.recentItem}>
              <View style={styles.recentLeft}>
                <View style={[styles.recentIcon, { backgroundColor: category?.color + '20' }]}>
                  <CategoryIcon iconName={category?.icon || 'HelpCircle'} color={category?.color || '#666'} size={16} />
                </View>
                <View>
                  <Text style={styles.recentDescription}>{transaction.description}</Text>
                  <Text style={styles.recentDate}>
                    {new Date(transaction.date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <Text style={[
                styles.recentAmount,
                { color: transaction.type === 'expense' ? '#FF6B6B' : '#00B894' }
              ]}>
                {transaction.type === 'expense' ? '-' : '+'}{currencySymbol}{transaction.amount.toFixed(2)}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  balanceCard: {
    margin: 16,
    padding: 24,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 8,
  },
  balanceAmount: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  balanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  balanceItemLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  balanceItemValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 2,
  },
  balanceDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  budgetCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  budgetPercentage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C5CE7',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  budgetDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
  },
  categoriesCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryName: {
    fontSize: 14,
    color: '#2C3E50',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  recentCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    marginBottom: 32,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recentIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recentDescription: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 2,
  },
  recentDate: {
    fontSize: 12,
    color: '#95A5A6',
  },
  recentAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
});
