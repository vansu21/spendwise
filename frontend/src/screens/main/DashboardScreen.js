import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../constants/api';
import * as SecureStore from 'expo-secure-store';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('month');

  useEffect(() => {
    fetchSummary();
  }, [filter]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('token');
      console.log('Token:', token ? 'exists' : 'NULL');

      let url = `${API_URL}/api/expenses/summary`;
      if (filter === 'month') {
        const month = new Date().toISOString().slice(0, 7);
        url += `?month=${month}`;
      }
      console.log('URL:', url);

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Totals:', JSON.stringify(res.data.totals));
      setSummary(res.data);
    } catch (err) {
      console.log('Summary error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = summary?.totals?.find(t => t._id === 'income')?.total || 0;
  const totalExpense = summary?.totals?.find(t => t._id === 'expense')?.total || 0;
  const balance = totalIncome - totalExpense;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.greeting}>👋 Hello, {user?.name || 'User'}!</Text>

      {/* Filter Toggle */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'month' && styles.filterBtnActive]}
          onPress={() => setFilter('month')}>
          <Text style={[styles.filterText, filter === 'month' && styles.filterTextActive]}>This Month</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
          onPress={() => setFilter('all')}>
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All Time</Text>
        </TouchableOpacity>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>
          {filter === 'month' ? 'This Month Balance' : 'All Time Balance'}
        </Text>
        <Text style={styles.balanceAmount}>₹{balance.toLocaleString()}</Text>
        <View style={styles.row}>
          <View style={styles.incomeBox}>
            <Text style={styles.boxLabel}>Income</Text>
            <Text style={styles.incomeAmount}>₹{totalIncome.toLocaleString()}</Text>
          </View>
          <View style={styles.expenseBox}>
            <Text style={styles.boxLabel}>Expenses</Text>
            <Text style={styles.expenseAmount}>₹{totalExpense.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Expenses')}>
          <Text style={styles.actionIcon}>💸</Text>
          <Text style={styles.actionText}>Add Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Budget')}>
          <Text style={styles.actionIcon}>🎯</Text>
          <Text style={styles.actionText}>Set Budget</Text>
        </TouchableOpacity>
      </View>

      {/* Category Breakdown */}
      {summary?.byCategory?.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Breakdown</Text>
          {summary.byCategory.map((item, index) => (
            <View key={index} style={styles.categoryRow}>
              <Text style={styles.categoryName}>{item._id.category}</Text>
              <Text style={styles.categoryType}>{item._id.type}</Text>
              <Text style={styles.categoryAmount}>₹{item.total.toLocaleString()}</Text>
            </View>
          ))}
        </>
      ) : (
        <Text style={styles.empty}>No data for this period</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  greeting: { fontSize: 24, fontWeight: 'bold', marginTop: 20 },
  filterRow: { flexDirection: 'row', backgroundColor: '#e0e0e0', borderRadius: 10, padding: 4, marginVertical: 16 },
  filterBtn: { flex: 1, padding: 8, borderRadius: 8, alignItems: 'center' },
  filterBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  filterText: { fontSize: 14, color: '#888', fontWeight: '600' },
  filterTextActive: { color: '#1e6ef4' },
  balanceCard: { backgroundColor: '#1e6ef4', borderRadius: 16, padding: 20, marginBottom: 24 },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  balanceAmount: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginVertical: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  incomeBox: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: 10, flex: 0.48 },
  expenseBox: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: 10, flex: 0.48 },
  boxLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  incomeAmount: { color: '#4ade80', fontSize: 18, fontWeight: 'bold' },
  expenseAmount: { color: '#f87171', fontSize: 18, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, marginTop: 8 },
  actionBtn: { backgroundColor: '#fff', borderRadius: 12, padding: 16, flex: 0.48, alignItems: 'center' },
  actionIcon: { fontSize: 28, marginBottom: 8 },
  actionText: { fontSize: 13, fontWeight: '600', color: '#333' },
  categoryRow: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryName: { fontSize: 14, fontWeight: '600', flex: 1 },
  categoryType: { fontSize: 12, color: '#888', marginRight: 8 },
  categoryAmount: { fontSize: 14, fontWeight: 'bold', color: '#1e6ef4' },
  empty: { textAlign: 'center', marginTop: 20, color: '#888', fontSize: 14 },
});