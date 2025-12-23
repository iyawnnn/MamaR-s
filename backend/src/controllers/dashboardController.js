const Sale = require('../models/Sale');
// Import the model from the productController to stay consistent
const { Model: Product } = require('../controllers/productController');

// Helper for date range
const getDayRange = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// 1. Get Stats (Revenue, Counts, Low Stock)
exports.getDashboardStats = async (req, res) => {
  try {
    const { start, end } = getDayRange();

    // Daily Sales
    const dailySales = await Sale.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" }, count: { $sum: 1 } } }
    ]);

    // Monthly Sales
    const firstDayMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthlySales = await Sale.aggregate([
      { $match: { date: { $gte: firstDayMonth } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);

    // Low Stock Calculation (Supports Sizes)
    const allProducts = await Product.find({ archived: false });
    let lowStockCount = 0;

    for (const p of allProducts) {
      if (p.hasVariants && p.variants.length > 0) {
        // If ANY size is low, count the product as low stock
        if (p.variants.some(v => v.stock <= (v.lowStockThreshold || 5))) {
          lowStockCount++;
        }
      } else {
        if (p.stock <= p.lowStockThreshold) {
          lowStockCount++;
        }
      }
    }

    res.json({
      dailySales: dailySales[0]?.total || 0,
      dailyOrders: dailySales[0]?.count || 0,
      monthlySales: monthlySales[0]?.total || 0,
      lowStockCount
    });

  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 2. Get Chart Data
exports.getSalesChart = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sales = await Sale.aggregate([
      { $match: { date: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          total: { $sum: "$totalPrice" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const labels = sales.map(s => s._id);
    const data = sales.map(s => s.total);

    res.json({ labels, data });
  } catch (err) {
    console.error("Chart Error:", err);
    res.status(500).json({ message: err.message });
  }
};