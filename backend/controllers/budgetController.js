const Budget = require('../models/Budget');

exports.getBudgets = async (req, res) => {
  try {
    const { month } = req.query;
    const query = { userId: req.user.id };
    if (month) query.month = month;
    const budgets = await Budget.find(query);
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.createBudget = async (req, res) => {
  try {
    const budget = await Budget.create({ ...req.body, userId: req.user.id });
    res.status(201).json(budget);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!budget) return res.status(404).json({ msg: 'Not found' });
    res.json(budget);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!budget) return res.status(404).json({ msg: 'Not found' });
    res.json({ msg: 'Deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};