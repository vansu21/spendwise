const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
    type: String,
    required: true,
    enum: ['Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Education', 'Bills', 'Other'],
  },
  limit:  { type: Number, required: true, min: 1 },
  month:  { type: String, required: true, match: /^\d{4}-(0[1-9]|1[0-2])$/ }, // "2026-04"
}, { timestamps: true });

BudgetSchema.index({ userId: 1, category: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);