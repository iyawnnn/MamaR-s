import { Request, Response } from 'express';
import Order from '../models/Order.js';
import Product from '../models/InventoryItem.js';

const getDayRange = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const { start, end } = getDayRange();

    const dailySales = await Order.aggregate([
      { $match: { status: 'FULFILLED', createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
    ]);

    const firstDayMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthlySales = await Order.aggregate([
      { $match: { status: 'FULFILLED', createdAt: { $gte: firstDayMonth } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    const allProducts = await Product.find({ archived: false });
    let lowStockCount = 0;

    for (const p of allProducts) {
      if (p.hasVariants && p.variants.length > 0) {
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

  } catch (err: any) {
    console.error("Dashboard Stats Error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getSalesChart = async (req: Request, res: Response) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sales = await Order.aggregate([
      { $match: { status: 'FULFILLED', createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const labels = sales.map(s => s._id);
    const data = sales.map(s => s.total);

    res.json({ labels, data });
  } catch (err: any) {
    console.error("Chart Error:", err);
    res.status(500).json({ message: err.message });
  }
};