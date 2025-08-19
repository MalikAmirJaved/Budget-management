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
import { Plus, X, Calendar, Target } from 'lucide-react-native';
import { CURRENCY_SYMBOLS } from '@/constants/categories';

export default function PlansScreen() {
  const { 
    transactions,
    categories, 
    settings,
    addTransaction,
    deleteTransaction,
    getPlannedTransactions 
  } = useBudget();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || '');
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [plannedDate, setPlannedDate] = useState('');

  const currencySymbol = CURRENCY_SYMBOLS[settings.currency] || '$';
  const plannedTransactions = useMemo(() => getPlannedTransactions(), [transactions]);

  const upcomingPlans = useMemo(() => {
    const now = new Date();
    return plannedTransactions
      .filter(t => new Date(t.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [plannedTransactions]);

  const pastPlans = useMemo(() => {
    const now = new Date();
    return plannedTransactions
      .filter(t => new Date(t.date) < now)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [plannedTransactions]);

  const totalPlannedExpenses = upcomingPlans
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPlannedIncome = upcomingPlans
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleAddPlan = async () => {
    if (!amount || !description || !plannedDate) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const planDate = new Date(plannedDate);
    if (planDate < new Date()) {
      Alert.alert('Error', 'Please select a future date');
      return;
    }

    await addTransaction({
      amount: parseFloat(amount),
      description,
      category: selectedCategory,
      type: transactionType,
      date: planDate.toISOString(),
      isPlanned: true,
    });

    setModalVisible(false);
    setAmount('');
    setDescription('');
    setPlannedDate('');
    setSelectedCategory(categories[0]?.id || '');
    setTransactionType('expense');
  };

  const handleDeletePlan = (id: string) => {
    Alert.alert(
      'Delete Plan',
      'Are you sure you want to delete this planned transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => deleteTransaction(id), style: 'destructive' }
      ]
    );
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <View style={styles.container}>
      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Target size={20} color="#6C5CE7" />
          <Text style={styles.summaryTitle}>Planned Summary</Text>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Expected Income</Text>
            <Text style={[styles.summaryValue, { color: '#00B894' }]}>
              {currencySymbol}{totalPlannedIncome.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Expected Expenses</Text>
            <Text style={[styles.summaryValue, { color: '#FF6B6B' }]}>
              {currencySymbol}{totalPlannedExpenses.toFixed(2)}
            </Text>
          </View>
        </View>
        <View style={styles.netPlanned}>
          <Text style={styles.netLabel}>Net Planned</Text>
          <Text style={[
            styles.netValue,
            { color: totalPlannedIncome - totalPlannedExpenses >= 0 ? '#00B894' : '#FF6B6B' }
          ]}>
            {currencySymbol}{(totalPlannedIncome - totalPlannedExpenses).toFixed(2)}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.plansList} showsVerticalScrollIndicator={false}>
        {/* Upcoming Plans */}
        {upcomingPlans.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Plans</Text>
            {upcomingPlans.map((transaction) => (
              <TransactionCard 
                key={transaction.id} 
                transaction={transaction}
                onDelete={handleDeletePlan}
              />
            ))}
          </View>
        )}

        {/* Past Plans */}
        {pastPlans.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Past Plans</Text>
            {pastPlans.map((transaction) => (
              <TransactionCard 
                key={transaction.id} 
                transaction={transaction}
                onDelete={handleDeletePlan}
              />
            ))}
          </View>
        )}

        {plannedTransactions.length === 0 && (
          <View style={styles.emptyState}>
            <Target size={48} color="#CCC" />
            <Text style={styles.emptyTitle}>No Plans Yet</Text>
            <Text style={styles.emptyText}>
              Start planning your future expenses and income
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Plus size={28} color="white" />
      </TouchableOpacity>

      {/* Add Plan Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Planned Transaction</Text>
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

            <TextInput
              style={styles.input}
              placeholder="Date (YYYY-MM-DD)"
              value={plannedDate}
              onChangeText={setPlannedDate}
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

            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddPlan}
            >
              <Text style={styles.addButtonText}>Add Plan</Text>
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
  summaryCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 16,
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
  },
  netPlanned: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
  },
  netLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  netValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  plansList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#95A5A6',
    textAlign: 'center',
    paddingHorizontal: 40,
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
