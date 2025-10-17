const express = require('express');
const router = express.Router();
const { recordSale } = require('../controllers/salesController');

router.post('/', recordSale);

module.exports = router;
