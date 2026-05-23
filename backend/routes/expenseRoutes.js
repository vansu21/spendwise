const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getExpenses, createExpense, updateExpense, deleteExpense, getSummary } = require('../controllers/expenseController');

router.get('/summary', auth, getSummary);
router.get('/', auth, getExpenses);
router.post('/', auth, createExpense);
router.put('/:id', auth, updateExpense);
router.delete('/:id', auth, deleteExpense);

module.exports = router;