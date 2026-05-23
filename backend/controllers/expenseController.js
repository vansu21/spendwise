const Expense = require('../models/Expense');
const mongoose = require('mongoose');
const redis = require('../config/redis');

exports.getExpenses = async (req, res) => {
  try {
    const { type, category, startDate, endDate } = req.query;
    const query = { userId: req.user.id };
    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    const expenses = await Expense.find(query).sort({ date: -1 });
    res.json({ expenses, total: expenses.length });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const expense = await Expense.create({ ...req.body, userId: req.user.id });
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!expense) return res.status(404).json({ msg: 'Not found' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!expense) return res.status(404).json({ msg: 'Not found' });
    res.json({ msg: 'Deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const { month } = req.query;
    const currentMonth = month || new Date().toISOString().slice(0, 7);
    const cacheKey = `summary:${req.user.id}:${currentMonth}`;

    
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log('Serving from cache');
      return res.json(JSON.parse(cached));
    }

    const [year, mon] = currentMonth.split('-');
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 0, 23, 59, 59);
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const byCategory = await Expense.aggregate([
      { $match: { userId, date: { $gte: start, $lte: end } } },
      { $group: { _id: { category: '$category', type: '$type' }, total: { $sum: '$amount' } } },
    ]);

    const totals = await Expense.aggregate([
      { $match: { userId, date: { $gte: start, $lte: end } } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]);

    const result = { byCategory, totals };

    
    await redis.setex(cacheKey, 3600, JSON.stringify(result));

    res.json(result);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};