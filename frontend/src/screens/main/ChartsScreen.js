import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useEffect, useState } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../../constants/api';
import { LineChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function ChartsScreen() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const res = await axios.get(`${API_URL}/api/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(res.data.expenses);
    } catch (err) {
      console.log('Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Last 7 days trend data
  const getLast7DaysData = () => {
    const days = [];
    const amounts = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toLocaleDateString('en', { weekday: 'short' });
      days.push(dayStr);

      const dayTotal = expenses
        .filter(e => {
          const expDate = new Date(e.date);
          return expDate.toDateString() === date.toDateString() && e.type === 'expense';
        })
        .reduce((sum, e) => sum + e.amount, 0);

      amounts.push(dayTotal);
    }

    return { days, amounts };
  };

  // Pie chart data by category
  const getPieData = () => {
    const categoryTotals = {};
    const colors = ['#1e6ef4', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

    expenses
      .filter(e => e.type === 'expense')
      .forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
      });

    return Object.entries(categoryTotals).map(([category, total], index) => ({
      name: category,
      amount: total,
      color: colors[index % colors.length],
      legendFontColor: '#333',
      legendFontSize: 12,
    }));
  };

  const { days, amounts } = getLast7DaysData();
  const pieData = getPieData();
  const hasData = amounts.some(a => a > 0);

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(30, 110, 244, ${opacity})`,
    strokeWidth: 2,
    decimalPlaces: 0,
    labelColor: () => '#888',
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading charts...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 Analytics</Text>

      {/* 7 Day Trend */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>7 Day Expense Trend</Text>
        {hasData ? (
          <LineChart
            data={{
              labels: days,
              datasets: [{ data: amounts.map(a => a || 0) }],
            }}
            width={screenWidth - 48}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        ) : (
          <Text style={styles.noData}>No expense data for last 7 days</Text>
        )}
      </View>

      {/* Pie Chart */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Spending by Category</Text>
        {pieData.length > 0 ? (
          <PieChart
            data={pieData}
            width={screenWidth - 48}
            height={200}
            chartConfig={chartConfig}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="10"
            style={styles.chart}
          />
        ) : (
          <Text style={styles.noData}>No expense data yet</Text>
        )}
      </View>

      {/* Category Summary */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Category Breakdown</Text>
        {pieData.length > 0 ? (
          pieData.map((item, index) => (
            <View key={index} style={styles.categoryRow}>
              <View style={[styles.dot, { backgroundColor: item.color }]} />
              <Text style={styles.categoryName}>{item.name}</Text>
              <Text style={styles.categoryAmount}>₹{item.amount.toLocaleString()}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noData}>No data yet</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 20, marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  chart: { borderRadius: 10 },
  noData: { textAlign: 'center', color: '#888', padding: 20 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  categoryName: { flex: 1, fontSize: 14, color: '#333' },
  categoryAmount: { fontSize: 14, fontWeight: 'bold', color: '#1e6ef4' },
});