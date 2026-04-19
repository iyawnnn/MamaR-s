import { Request, Response } from 'express';
import Order from '../models/Order.js';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter for FULFILLED orders that have a targetDate (or createdAt) today
    const dailySales = await Order.aggregate([
      { 
        $match: { 
          status: 'FULFILLED',
          $or: [
            { targetDate: { $gte: today } },
            { createdAt: { $gte: today } }
          ]
        } 
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlySales = await Order.aggregate([
      { 
        $match: { 
          status: 'FULFILLED',
          $or: [
            { targetDate: { $gte: startOfMonth } },
            { createdAt: { $gte: startOfMonth } }
          ]
        } 
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    res.json({
      dailySales: dailySales[0]?.total || 0,
      monthlySales: monthlySales[0]?.total || 0,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getSalesOverTime = async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;
    const startDate = start ? new Date(start as string) : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = end ? new Date(end as string) : new Date();

    const sales = await Order.aggregate([
      { 
        $match: { 
          status: 'FULFILLED',
          targetDate: { $gte: startDate, $lte: endDate } 
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$targetDate" } },
          total: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const labels = sales.map(s => s._id);
    const data = sales.map(s => s.total);

    res.json({ labels, data });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};