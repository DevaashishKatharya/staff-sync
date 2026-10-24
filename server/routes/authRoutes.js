const express = require('express');
const router = express.Router();
const { login, getMe, quickLogin } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/login', login);
router.post('/demo-switch', quickLogin);
router.get('/me', verifyToken, getMe);

module.exports = router;
