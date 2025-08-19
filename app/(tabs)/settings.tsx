import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert
} from 'react-native';
import { useBudget } from '@/hooks/budget-context';
import { CURRENCY_SYMBOLS } from '@/constants/categories';
import { 
  Settings as SettingsIcon, 
  Bell, 
  DollarSign, 
  AlertTriangle,
  Info,
  ChevronRight
} from 'lucide-react-native';

export default function SettingsScreen() {
  const { settings, saveSettings } = useBudget();
  const [notifications, setNotifications] = useState(settings.notifications);
  const [warningThreshold, setWarningThreshold] = useState(settings.budgetWarningThreshold);
  const [selectedCurrency, setSelectedCurrency] = useState(settings.currency);

  const handleSaveSettings = async () => {
    await saveSettings({
      currency: selectedCurrency,
      notifications,
      budgetWarningThreshold: warningThreshold,
    });
    Alert.alert('Success', 'Settings saved successfully');
  };

  const currencies = Object.keys(CURRENCY_SYMBOLS);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Notifications */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Bell size={20} color="#6C5CE7" />
          <Text style={styles.sectionTitle}>Notifications</Text>
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingLabel}>Budget Warnings</Text>
            <Text style={styles.settingDescription}>
              Get notified when approaching budget limit
            </Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#E0E0E0', true: '#A29BFE' }}
            thumbColor={notifications ? '#6C5CE7' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Currency */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <DollarSign size={20} color="#6C5CE7" />
          <Text style={styles.sectionTitle}>Currency</Text>
        </View>
        
        <View style={styles.currencyGrid}>
          {currencies.map((currency) => (
            <TouchableOpacity
              key={currency}
              style={[
                styles.currencyOption,
                selectedCurrency === currency && styles.currencyOptionSelected
              ]}
              onPress={() => setSelectedCurrency(currency)}
            >
              <Text style={styles.currencySymbol}>
                {CURRENCY_SYMBOLS[currency]}
              </Text>
              <Text style={[
                styles.currencyCode,
                selectedCurrency === currency && styles.currencyCodeSelected
              ]}>
                {currency}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Budget Warning Threshold */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AlertTriangle size={20} color="#6C5CE7" />
          <Text style={styles.sectionTitle}>Warning Threshold</Text>
        </View>
        
        <Text style={styles.thresholdDescription}>
          Alert when budget usage reaches:
        </Text>
        
        <View style={styles.thresholdOptions}>
          {[60, 70, 80, 90].map((threshold) => (
            <TouchableOpacity
              key={threshold}
              style={[
                styles.thresholdOption,
                warningThreshold === threshold && styles.thresholdOptionSelected
              ]}
              onPress={() => setWarningThreshold(threshold)}
            >
              <Text style={[
                styles.thresholdText,
                warningThreshold === threshold && styles.thresholdTextSelected
              ]}>
                {threshold}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Info size={20} color="#6C5CE7" />
          <Text style={styles.sectionTitle}>About</Text>
        </View>
        
        <TouchableOpacity style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>Version</Text>
          <View style={styles.aboutRight}>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>Privacy Policy</Text>
          <ChevronRight size={20} color="#C0C0C0" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>Terms of Service</Text>
          <ChevronRight size={20} color="#C0C0C0" />
        </TouchableOpacity>
      </View>

      {/* Save Button */}
      <TouchableOpacity 
        style={styles.saveButton}
        onPress={handleSaveSettings}
      >
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Budget Manager</Text>
        <Text style={styles.footerSubtext}>Manage your finances wisely</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLeft: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  currencyOption: {
    flex: 1,
    minWidth: '30%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  currencyOptionSelected: {
    borderColor: '#6C5CE7',
    backgroundColor: '#F0F0FF',
  },
  currencySymbol: {
    fontSize: 24,
    color: '#2C3E50',
    marginBottom: 4,
  },
  currencyCode: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  currencyCodeSelected: {
    color: '#6C5CE7',
    fontWeight: '600',
  },
  thresholdDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 16,
  },
  thresholdOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  thresholdOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  thresholdOptionSelected: {
    borderColor: '#6C5CE7',
    backgroundColor: '#F0F0FF',
  },
  thresholdText: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  thresholdTextSelected: {
    color: '#6C5CE7',
    fontWeight: '600',
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  aboutLabel: {
    fontSize: 16,
    color: '#2C3E50',
  },
  aboutRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aboutValue: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  saveButton: {
    backgroundColor: '#6C5CE7',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#7F8C8D',
  },
});
