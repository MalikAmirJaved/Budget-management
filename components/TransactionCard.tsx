import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Transaction } from '@/types/budget';
import { CategoryIcon } from './CategoryIcon';
import { useBudget } from '@/hooks/budget-context';
import { CURRENCY_SYMBOLS } from '@/constants/categories';
import { Trash2 } from 'lucide-react-native';

interface TransactionCardProps {
  transaction: Transaction;
  onDelete?: (id: string) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, onDelete }) => {
  const { categories, settings } = useBudget();
  const category = categories.find(c => c.id === transaction.category);
  const currencySymbol = CURRENCY_SYMBOLS[settings.currency] || '$';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={[styles.iconContainer, { backgroundColor: category?.color + '20' }]}>
          <CategoryIcon 
            iconName={category?.icon || 'HelpCircle'} 
            color={category?.color || '#666'} 
            size={20}
          />
        </View>
        <View style={styles.details}>
          <Text style={styles.description}>{transaction.description}</Text>
          <Text style={styles.category}>{category?.name || 'Unknown'}</Text>
          <Text style={styles.date}>{formatDate(transaction.date)}</Text>
        </View>
      </View>
      <View style={styles.rightSection}>
        <Text style={[
          styles.amount,
          { color: transaction.type === 'expense' ? '#FF6B6B' : '#00B894' }
        ]}>
          {transaction.type === 'expense' ? '-' : '+'}{currencySymbol}{transaction.amount.toFixed(2)}
        </Text>
        {onDelete && (
          <TouchableOpacity onPress={() => onDelete(transaction.id)} style={styles.deleteButton}>
            <Trash2 size={16} color="#FF6B6B" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  category: {
    fontSize: 13,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#95A5A6',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  deleteButton: {
    padding: 4,
  },
});
