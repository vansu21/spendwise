import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../../constants/api';


const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Education', 'Bills', 'Other'];

export default function BudgetScreen() {
  const [budgets, setBudgets] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState('Food');
  const [limit, setLimit] = useState('');
  const month = new Date().toISOString().slice(0, 7);
  

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const res = await axios.get(`${API_URL}/api/budgets?month=${month}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBudgets(res.data);
    } catch (err) {
      console.log('Error:', err.message);
    }
  };

  const addBudget = async () => {
    if (!limit) return Alert.alert('Error', 'Enter a budget limit');
    try {
      const token = await SecureStore.getItemAsync('token');
      await axios.post(`${API_URL}/api/budgets`,
        { category, limit: Number(limit), month },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModalVisible(false);
      setLimit('');
      fetchBudgets();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.msg || 'Failed to add budget');
    }
  };

  const deleteBudget = async (id) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      await axios.delete(`${API_URL}/api/budgets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBudgets();
    } catch (err) {
      Alert.alert('Error', 'Failed to delete');
    }
  };



  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Budgets</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.monthText}>📅 {month}</Text>

      <FlatList
        data={budgets}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.budgetItem}>
            <View style={styles.budgetLeft}>
              <Text style={styles.budgetCategory}>{item.category}</Text>
              <Text style={styles.budgetMonth}>{item.month}</Text>
            </View>
            <View style={styles.budgetRight}>
              <Text style={styles.budgetLimit}>₹{item.limit}</Text>
              <TouchableOpacity onPress={() => deleteBudget(item._id)}>
                <Text style={styles.deleteBtn}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No budgets set. Add one!</Text>}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Set Budget</Text>

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

            <TextInput
              style={styles.input}
              placeholder="Budget Limit (₹)"
              value={limit}
              onChangeText={setLimit}
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.saveBtn} onPress={addBudget}>
              <Text style={styles.saveBtnText}>Save Budget</Text>
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
  monthText: { padding: 16, fontSize: 14, color: '#888' },
  budgetItem: { backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 4, borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  budgetLeft: { flex: 1 },
  budgetCategory: { fontSize: 16, fontWeight: '600' },
  budgetMonth: { fontSize: 12, color: '#888', marginTop: 2 },
  budgetRight: { alignItems: 'flex-end', gap: 4 },
  budgetLimit: { fontSize: 18, fontWeight: 'bold', color: '#1e6ef4' },
  deleteBtn: { fontSize: 16 },
  empty: { textAlign: 'center', marginTop: 40, color: '#888', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  categoryScroll: { marginBottom: 16 },
  catBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', marginRight: 8 },
  catBtnActive: { backgroundColor: '#1e6ef4', borderColor: '#1e6ef4' },
  catBtnText: { fontSize: 13, color: '#333' },
  catBtnTextActive: { color: '#fff' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 16 },
  saveBtn: { backgroundColor: '#1e6ef4', borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 8 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancelBtn: { borderRadius: 10, padding: 12, alignItems: 'center' },
  cancelBtnText: { color: '#888', fontSize: 15 },
});