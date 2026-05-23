const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:    { type: String, required: true, trim: true },
  amount:   { type: Number, required: true, min: 0.01 },
  category: {
    type: String,
    enum: ['Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Education', 'Bills', 'Other'],
    default: 'Other',
  },
  type: { type: String, enum: ['income', 'expense'], required: true },
  date: { type: Date, default: Date.now },
  note: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);