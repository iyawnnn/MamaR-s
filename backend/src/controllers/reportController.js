// backend/controllers/reportController.js
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');

exports.summary = async (req, res) => {
  try {
    const { start, end } = req.query;
    const startDate = start ? new Date(start) : new Date('1970-01-01');
    const endDate = end ? new Date(end) : new Date();
    // include end day's full time
    if (end) { endDate.setHours(23,59,59,999); }

    // 1) sales aggregation
    const salesAgg = await Sale.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: null,
          grossSales: { $sum: { $ifNull: ['$grossAmount', 0] } },
          discounts: { $sum: { $ifNull: ['$discount', 0] } },
          netSales: { $sum: { $ifNull: ['$netAmount', '$grossAmount'] } }, // fallback
          totalCogs: { $sum: { $ifNull: ['$cogs', 0] } },
        }
      }
    ]);

    const salesSummary = salesAgg[0] || { grossSales: 0, discounts: 0, netSales: 0, totalCogs: 0 };

    // 2) expenses aggregation
    const expensesAgg = await Expense.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: null,
          operatingExpenses: { $sum: { $ifNull: ['$amount', 0] } }
        }
      }
    ]);
    const expensesSummary = expensesAgg[0] || { operatingExpenses: 0 };

    // 3) derived
    const grossProfit = (salesSummary.netSales || 0) - (salesSummary.totalCogs || 0);
    const netProfit = grossProfit - (expensesSummary.operatingExpenses || 0);

    res.json({
      grossSales: Number((salesSummary.grossSales || 0).toFixed(2)),
      discounts: Number((salesSummary.discounts || 0).toFixed(2)),
      netSales: Number((salesSummary.netSales || 0).toFixed(2)),
      cogs: Number((salesSummary.totalCogs || 0).toFixed(2)),
      grossProfit: Number(grossProfit.toFixed(2)),
      operatingExpenses: Number((expensesSummary.operatingExpenses || 0).toFixed(2)),
      netProfit: Number(netProfit.toFixed(2))
    });
  } catch (err) {
    console.error('Report summary error:', err);
    res.status(500).json({ message: err.message });
  }
};
