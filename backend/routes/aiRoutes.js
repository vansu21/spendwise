const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { categorize, chat } = require('../controllers/aiControllerGemini');

router.post('/categorize', auth, categorize);
router.post('/chat', auth, chat);

module.exports = router;