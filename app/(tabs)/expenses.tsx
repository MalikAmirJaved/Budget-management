import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  TextInput,
  Alert,
  Platform
} from 'react-native';
import { useBudget } from '@/hooks/budget-context';
import { TransactionCard } from '@/components/TransactionCard';
import { CategoryIcon } from '@/components/CategoryIcon';
import { Plus, X, Calendar, Clock } from 'lucide-react-native';
import { CURRENCY_SYMBOLS } from '@/constants/categories';

export default function ExpensesScreen() {
  const { 
    transactions, 
    categories, 
    settings,
    addTransaction,
    deleteTransaction,
    getMonthlyData 
  } = useBudget();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || '');
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const currencySymbol = CURRENCY_SYMBOLS[settings.currency] || '$';
  const monthlyData = getMonthlyData(selectedMonth, selectedYear);

  const currentTransactions = useMemo(() => {
    return monthlyData.transactions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [monthlyData]);

  const handleAddTransaction = async () => {
    if (!amount || !description) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    await addTransaction({
      amount: parseFloat(amount),
      description,
      category: selectedCategory,
      type: transactionType,
      date: new Date().toISOString(),
      isPlanned: false,
    });

    setModalVisible(false);
    setAmount('');
    setDescription('');
    setSelectedCategory(categories[0]?.id || '');
    setTransactionType('expense');
  };

  const handleDeleteTransaction = (id: string) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => deleteTransaction(id), style: 'destructive' }
      ]
    );
  };

  const isCurrentMonth = selectedMonth === new Date().getMonth() && 
                         selectedYear === new Date().getFullYear();

  return (
    <View style={styles.container}>
      {/* Month Selector */}
      <View style={styles.monthSelector}>
        <TouchableOpacity 
          style={styles.monthButton}
          onPress={() => {
            if (selectedMonth === 0) {
              setSelectedMonth(11);
              setSelectedYear(selectedYear - 1);
            } else {
              setSelectedMonth(selectedMonth - 1);
            }
          }}
        >
          <Text style={styles.monthButtonText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.monthDisplay}>
          <Calendar size={16} color="#6C5CE7" />
          <Text style={styles.monthText}>
            {monthlyData.month} {monthlyData.year}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.monthButton}
          onPress={() => {
            const now = new Date();
            if (selectedMonth < now.getMonth() || selectedYear < now.getFullYear()) {
              if (selectedMonth === 11) {
                setSelectedMonth(0);
                setSelectedYear(selectedYear + 1);
              } else {
                setSelectedMonth(selectedMonth + 1);
              }
            }
          }}
          disabled={isCurrentMonth}
        >
          <Text style={[styles.monthButtonText, isCurrentMonth && styles.disabledText]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={[styles.summaryValue, { color: '#00B894' }]}>
            {currencySymbol}{monthlyData.totalIncome.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Expenses</Text>
          <Text style={[styles.summaryValue, { color: '#FF6B6B' }]}>
            {currencySymbol}{monthlyData.totalExpenses.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Balance</Text>
          <Text style={[
            styles.summaryValue, 
            { color: monthlyData.totalIncome - monthlyData.totalExpenses >= 0 ? '#00B894' : '#FF6B6B' }
          ]}>
            {currencySymbol}{(monthlyData.totalIncome - monthlyData.totalExpenses).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Transactions List */}
      <ScrollView style={styles.transactionsList} showsVerticalScrollIndicator={false}>
        {currentTransactions.length > 0 ? (
          currentTransactions.map((transaction) => (
            <TransactionCard 
              key={transaction.id} 
              transaction={transaction}
              onDelete={isCurrentMonth ? handleDeleteTransaction : undefined}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No transactions for this month</Text>
          </View>
        )}
      </ScrollView>

      {/* Add Button - Only show for current month */}
      {isCurrentMonth && (
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Plus size={28} color="white" />
        </TouchableOpacity>
      )}

      {/* Add Transaction Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Transaction</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Transaction Type Toggle */}
            <View style={styles.typeToggle}>
              <TouchableOpacity 
                style={[styles.typeButton, transactionType === 'expense' && styles.typeButtonActive]}
                onPress={() => setTransactionType('expense')}
              >
                <Text style={[styles.typeButtonText, transactionType === 'expense' && styles.typeButtonTextActive]}>
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.typeButton, transactionType === 'income' && styles.typeButtonActive]}
                onPress={() => setTransactionType('income')}
              >
                <Text style={[styles.typeButtonText, transactionType === 'income' && styles.typeButtonTextActive]}>
                  Income
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholderTextColor="#999"
            />

            <TextInput
              style={styles.input}
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              placeholderTextColor="#999"
            />

            {/* Category Selection */}
            <Text style={styles.categoryLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories
                .filter(c => transactionType === 'income' ? c.id === '9' : c.id !== '9')
                .map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryOption,
                    selectedCategory === category.id && styles.categoryOptionSelected,
                    { borderColor: selectedCategory === category.id ? category.color : '#E0E0E0' }
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <CategoryIcon iconName={category.icon} color={category.color} size={20} />
                  <Text style={styles.categoryOptionText}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.currentDateTime}>
              <Clock size={16} color="#666" />
              <Text style={styles.dateTimeText}>
                {new Date().toLocaleString()}
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddTransaction}
            >
              <Text style={styles.addButtonText}>Add Transaction</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  monthButton: {
    padding: 8,
  },
  monthButtonText: {
    fontSize: 24,
    color: '#6C5CE7',
  },
  disabledText: {
    color: '#CCC',
  },
  monthDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
  },
  transactionsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#95A5A6',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: 'white',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#6C5CE7',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#2C3E50',
  },
  categoryLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  categoryScroll: {
    marginBottom: 20,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryOptionSelected: {
    backgroundColor: '#F0F0FF',
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#2C3E50',
  },
  currentDateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    justifyContent: 'center',
  },
  dateTimeText: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    backgroundColor: '#6C5CE7',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
