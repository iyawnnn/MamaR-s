// backend/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const verifyToken = require('../middleware/auth');

router.get('/sales-over-time', verifyToken, dashboardController.salesOverTime);
router.get('/gross-vs-net', verifyToken, dashboardController.grossVsNet);
router.get('/sales-by-category', verifyToken, dashboardController.salesByCategory);

module.exports = router;
