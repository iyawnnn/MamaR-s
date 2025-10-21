// backend/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const { salesOverTime, grossVsNet, salesByCategory } = require('../controllers/dashboardController');
const verifyToken = require('../middleware/auth');

router.get('/sales-over-time', verifyToken, salesOverTime);
router.get('/gross-vs-net', verifyToken, grossVsNet);
router.get('/sales-by-category', verifyToken, salesByCategory);

module.exports = router;
