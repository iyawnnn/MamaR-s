// backend/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const { summary } = require('../controllers/reportController');

// GET /api/reports/summary?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/summary', /* verifyToken, */ summary);

module.exports = router;
