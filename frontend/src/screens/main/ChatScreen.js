import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../../constants/api';

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hi! I am your SpendWise AI assistant. Ask me anything about your expenses! 💸', isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now().toString(), text: input, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const token = await SecureStore.getItemAsync('token');
      const res = await axios.post(`${API_URL}/api/ai/chat`,
        { message: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const botMessage = { id: (Date.now() + 1).toString(), text: res.data.reply, isBot: true };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = { id: (Date.now() + 1).toString(), text: 'Sorry, something went wrong!', isBot: true };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <Text style={styles.title}>🤖 AI Assistant</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.messageBubble, item.isBot ? styles.botBubble : styles.userBubble]}>
            <Text style={[styles.messageText, item.isBot ? styles.botText : styles.userText]}>
              {item.text}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.messageList}
      />

      {loading && (
        <Text style={styles.typing}>AI is typing...</Text>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask about your expenses..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendBtnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, paddingTop: 40, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold' },
  messageList: { padding: 16 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 8 },
  botBubble: { backgroundColor: '#fff', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: '#1e6ef4', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 22 },
  botText: { color: '#333' },
  userText: { color: '#fff' },
  typing: { paddingHorizontal: 16, paddingBottom: 8, color: '#888', fontSize: 13 },
  inputRow: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15 },
  sendBtn: { backgroundColor: '#1e6ef4', borderRadius: 20, paddingHorizontal: 20, justifyContent: 'center' },
  sendBtnText: { color: '#fff', fontWeight: 'bold' },
});