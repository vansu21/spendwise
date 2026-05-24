import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../../constants/api';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Education', 'Bills', 'Other'];

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [type, setType] = useState('expense');

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

  const addExpense = async () => {
    if (!title || !amount) return Alert.alert('Error', 'Fill in all fields');
    try {
      const token = await SecureStore.getItemAsync('token');
      await axios.post(`${API_URL}/api/expenses`, 
        { title, amount: Number(amount), category, type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModalVisible(false);
      setTitle('');
      setAmount('');
      fetchExpenses();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.msg || 'Failed to add');
    }
  };

  const deleteExpense = async (id) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      await axios.delete(`${API_URL}/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchExpenses();
    } catch (err) {
      Alert.alert('Error', 'Failed to delete');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expenses</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={expenses}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.expenseItem}>
            <View style={styles.expenseLeft}>
              <Text style={styles.expenseTitle}>{item.title}</Text>
              <Text style={styles.expenseCategory}>{item.category} • {item.type}</Text>
            </View>
            <View style={styles.expenseRight}>
              <Text style={[styles.expenseAmount, item.type === 'income' ? styles.income : styles.expense]}>
                {item.type === 'income' ? '+' : '-'}₹{item.amount}
              </Text>
              <TouchableOpacity onPress={() => deleteExpense(item._id)}>
                <Text style={styles.deleteBtn}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No expenses yet. Add one!</Text>}
      />

      {/* Add Expense Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Transaction</Text>

            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeBtn, type === 'expense' && styles.typeBtnActive]}
                onPress={() => setType('expense')}>
                <Text style={[styles.typeBtnText, type === 'expense' && styles.typeBtnTextActive]}>Expense</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, type === 'income' && styles.typeBtnActive]}
                onPress={() => setType('income')}>
                <Text style={[styles.typeBtnText, type === 'income' && styles.typeBtnTextActive]}>Income</Text>
              </TouchableOpacity>
            </View>

            <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
            <TextInput style={styles.input} placeholder="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" />

            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catBtn, category === cat && styles.catBtnActive]}
                  onPress={() => setCategory(cat)}>
                  <Text style={[styles.catBtnText, category === cat && styles.catBtnTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.saveBtn} onPress={addExpense}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 40, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold' },
  addBtn: { backgroundColor: '#1e6ef4', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  expenseItem: { backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 4, borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  expenseLeft: { flex: 1 },
  expenseTitle: { fontSize: 15, fontWeight: '600' },
  expenseCategory: { fontSize: 12, color: '#888', marginTop: 2 },
  expenseRight: { alignItems: 'flex-end', gap: 4 },
  expenseAmount: { fontSize: 16, fontWeight: 'bold' },
  income: { color: '#22c55e' },
  expense: { color: '#ef4444' },
  deleteBtn: { fontSize: 16 },
  empty: { textAlign: 'center', marginTop: 40, color: '#888', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  typeBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  typeBtnActive: { backgroundColor: '#1e6ef4', borderColor: '#1e6ef4' },
  typeBtnText: { fontWeight: '600', color: '#333' },
  typeBtnTextActive: { color: '#fff' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  categoryScroll: { marginBottom: 16 },
  catBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', marginRight: 8 },
  catBtnActive: { backgroundColor: '#1e6ef4', borderColor: '#1e6ef4' },
  catBtnText: { fontSize: 13, color: '#333' },
  catBtnTextActive: { color: '#fff' },
  saveBtn: { backgroundColor: '#1e6ef4', borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 8 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancelBtn: { borderRadius: 10, padding: 12, alignItems: 'center' },
  cancelBtnText: { color: '#888', fontSize: 15 },
});