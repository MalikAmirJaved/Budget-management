import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import { useBudget } from '@/hooks/budget-context';
import { CURRENCY_SYMBOLS } from '@/constants/categories';
import { Wallet, AlertCircle, TrendingUp, PiggyBank } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function WalletScreen() {
  const { wallet, settings, saveWallet, getCurrentMonthExpenses } = useBudget();
  const [balance, setBalance] = useState(wallet.totalBalance.toString());
  const [monthlyBudget, setMonthlyBudget] = useState(wallet.monthlyBudget.toString());
  const [isEditing, setIsEditing] = useState(false);

  const currencySymbol = CURRENCY_SYMBOLS[settings.currency] || '$';
  const monthExpenses = getCurrentMonthExpenses();
  const budgetRemaining = wallet.monthlyBudget - monthExpenses;
  const budgetUsagePercent = wallet.monthlyBudget > 0 ? (monthExpenses / wallet.monthlyBudget) * 100 : 0;
  const isOverBudget = budgetUsagePercent > 100;
  const isNearLimit = budgetUsagePercent >= settings.budgetWarningThreshold;

  const handleSave = async () => {
    const newBalance = parseFloat(balance) || 0;
    const newBudget = parseFloat(monthlyBudget) || 0;

    if (newBalance < 0 || newBudget < 0) {
      Alert.alert('Error', 'Please enter valid positive amounts');
      return;
    }

    await saveWallet({
      ...wallet,
      totalBalance: newBalance,
      monthlyBudget: newBudget,
    });

    setIsEditing(false);
    Alert.alert('Success', 'Wallet updated successfully');
  };

  const handleCancel = () => {
    setBalance(wallet.totalBalance.toString());
    setMonthlyBudget(wallet.monthlyBudget.toString());
    setIsEditing(false);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Wallet Card */}
      <LinearGradient
        colors={['#6C5CE7', '#A29BFE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.walletCard}
      >
        <View style={styles.walletHeader}>
          <Wallet size={24} color="white" />
          <Text style={styles.walletTitle}>My Wallet</Text>
        </View>
        
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>
          {currencySymbol}{wallet.totalBalance.toFixed(2)}
        </Text>

        <View style={styles.walletDivider} />

        <View style={styles.walletRow}>
          <View>
            <Text style={styles.walletSubLabel}>Monthly Budget</Text>
            <Text style={styles.walletSubValue}>
              {currencySymbol}{wallet.monthlyBudget.toFixed(2)}
            </Text>
          </View>
          <View>
            <Text style={styles.walletSubLabel}>Spent This Month</Text>
            <Text style={styles.walletSubValue}>
              {currencySymbol}{monthExpenses.toFixed(2)}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Budget Status */}
      {wallet.monthlyBudget > 0 && (
        <View style={[
          styles.statusCard,
          isOverBudget ? styles.statusDanger : isNearLimit ? styles.statusWarning : styles.statusSafe
        ]}>
          <AlertCircle 
            size={20} 
            color={isOverBudget ? '#FF6B6B' : isNearLimit ? '#FFA500' : '#00B894'} 
          />
          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>
              {isOverBudget ? 'Over Budget!' : isNearLimit ? 'Budget Warning' : 'On Track'}
            </Text>
            <Text style={styles.statusText}>
              {isOverBudget 
                ? `You've exceeded your budget by ${currencySymbol}${Math.abs(budgetRemaining).toFixed(2)}`
                : isNearLimit 
                ? `${budgetUsagePercent.toFixed(0)}% of budget used`
                : `${currencySymbol}${budgetRemaining.toFixed(2)} remaining`
              }
            </Text>
          </View>
        </View>
      )}

      {/* Budget Progress */}
      {wallet.monthlyBudget > 0 && (
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Budget Usage</Text>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar,
                { 
                  width: `${Math.min(budgetUsagePercent, 100)}%`,
                  backgroundColor: isOverBudget ? '#FF6B6B' : isNearLimit ? '#FFA500' : '#00B894'
                }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {budgetUsagePercent.toFixed(1)}% used
          </Text>
        </View>
      )}

      {/* Edit Form */}
      <View style={styles.editCard}>
        <Text style={styles.editTitle}>
          {isEditing ? 'Edit Wallet' : 'Wallet Settings'}
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Total Balance</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={balance}
            onChangeText={setBalance}
            keyboardType="decimal-pad"
            editable={isEditing}
            placeholder="0.00"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Monthly Budget</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={monthlyBudget}
            onChangeText={setMonthlyBudget}
            keyboardType="decimal-pad"
            editable={isEditing}
            placeholder="0.00"
            placeholderTextColor="#999"
          />
        </View>

        {isEditing ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.editButtonText}>Edit Wallet</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tips Card */}
      <View style={styles.tipsCard}>
        <View style={styles.tipsHeader}>
          <PiggyBank size={20} color="#6C5CE7" />
          <Text style={styles.tipsTitle}>Budget Tips</Text>
        </View>
        <View style={styles.tip}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>Set a realistic monthly budget based on your income</Text>
        </View>
        <View style={styles.tip}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>Track expenses daily to stay within budget</Text>
        </View>
        <View style={styles.tip}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>Review and adjust your budget monthly</Text>
        </View>
        <View style={styles.tip}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>Save at least 20% of your income</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  walletCard: {
    margin: 16,
    padding: 24,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  walletTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  walletDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginVertical: 20,
  },
  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  walletSubLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  walletSubValue: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  statusSafe: {
    backgroundColor: '#E8F5E9',
  },
  statusWarning: {
    backgroundColor: '#FFF3E0',
  },
  statusDanger: {
    backgroundColor: '#FFEBEE',
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  progressCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  editCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2C3E50',
    backgroundColor: 'white',
  },
  inputDisabled: {
    backgroundColor: '#F8F9FA',
    color: '#7F8C8D',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#6C5CE7',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#6C5CE7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    marginBottom: 32,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  tip: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tipBullet: {
    fontSize: 14,
    color: '#6C5CE7',
    marginRight: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
});
