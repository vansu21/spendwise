const { GoogleGenerativeAI } = require('@google/generative-ai');
const Expense = require('../models/Expense');
const mongoose = require('mongoose');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Education', 'Bills', 'Other'];

// Auto categorize expense
exports.categorize = async (req, res) => {
  try {
    const { title, amount } = req.body;

    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

    const prompt = `You are an expense categorizer. Given this expense, return ONLY one category from this list: ${CATEGORIES.join(', ')}. 
    Expense: "${title}" for amount ${amount}.
    Return only the category name, nothing else.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 10 },
    });

    const category = result.response.text().trim();
    const validCategory = CATEGORIES.includes(category) ? category : 'Other';
    res.json({ category: validCategory });
  } catch (err) {
    console.log('Categorize Error:', err.message);
    res.status(500).json({ msg: err.message });
  }
};

// AI Chatbot
exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const expenses = await Expense.find({ userId })
      .sort({ date: -1 })
      .limit(50);

    const expenseSummary = expenses.map(e =>
      `${e.title} - ₹${e.amount} (${e.category}, ${e.type}, ${new Date(e.date).toLocaleDateString()})`
    ).join('\n');

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      systemInstruction: `You are a personal finance assistant for SpendWise app. Here are the user's recent expenses:\n${expenseSummary}`,
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: message }] }],
      generationConfig: { maxOutputTokens: 500 },
    });

    const reply = result.response.text().trim();
    res.json({ reply });
  } catch (err) {
    console.log('AI Chat Error:', err.message);
    res.status(500).json({ msg: err.message });
  }
};