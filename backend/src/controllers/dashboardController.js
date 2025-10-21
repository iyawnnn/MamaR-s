// backend/controllers/dashboardController.js
const Sale = require("../models/Sale");
const Expense = require("../models/Expense");
const Product = require("../models/Product");
const mongoose = require("mongoose");

// Helper: safe parse dates and defaults
const parseDates = (startStr, endStr, defaultDays = 7) => {
  const end = endStr ? new Date(endStr) : new Date();
  let start;
  if (startStr) start = new Date(startStr);
  else start = new Date(end.getTime() - defaultDays * 24 * 60 * 60 * 1000);
  // normalize time to 00:00:00 for start and 23:59:59.999 for end (inclusive)
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

exports.salesOverTime = async (req, res) => {
  try {
    const { start: startQ, end: endQ, type = "net" } = req.query;
    const { start, end } = parseDates(startQ, endQ, 6); // last 7 days by default

    // Prevent enormous requests
    const msDiff = end - start;
    const days = Math.ceil(msDiff / (1000 * 60 * 60 * 24)) + 1;
    if (days > 366)
      return res
        .status(400)
        .json({ message: "Range too large. Max 366 days." });

    // salesOverTime aggregation
    const series = await Sale.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            day: { $dayOfMonth: "$date" },
          },
          gross: { $sum: "$totalPrice" }, // ✅ use totalPrice instead of grossAmount
          discounts: { $sum: "$discount" },
        },
      },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day",
            },
          },
          gross: 1,
          discounts: 1,
          net: { $subtract: ["$gross", "$discounts"] }, // ✅ derive net
          _id: 0,
        },
      },
    ]);

    const mapped = series.map((s) => ({
      date: s.date.toISOString().slice(0, 10),
      gross: Number((s.gross || 0).toFixed(2)),
      discounts: Number((s.discounts || 0).toFixed(2)),
      net: Number((s.net || 0).toFixed(2)),
      cogs: Number((s.cogs || 0).toFixed(2)),
    }));

    res.json({
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
      days,
      series: mapped,
      type,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.grossVsNet = async (req, res) => {
  try {
    const { start: startQ, end: endQ } = req.query;
    const { start, end } = parseDates(startQ, endQ, 29); // default last 30 days

    const msDiff = end - start;
    const days = Math.ceil(msDiff / (1000 * 60 * 60 * 24)) + 1;
    // if > 60 days, group by month
    const groupByMonth = days > 60;

    const groupId = groupByMonth
      ? { year: { $year: "$date" }, month: { $month: "$date" } }
      : {
          year: { $year: "$date" },
          month: { $month: "$date" },
          day: { $dayOfMonth: "$date" },
        };

    const projectDate = groupByMonth
      ? { $dateFromParts: { year: "$_id.year", month: "$_id.month", day: 1 } }
      : {
          $dateFromParts: {
            year: "$_id.year",
            month: "$_id.month",
            day: "$_id.day",
          },
        };

    const agg = await Sale.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: groupId,
          gross: { $sum: "$totalPrice" }, // ✅ correct
          discounts: { $sum: "$discount" },
        },
      },
      {
        $project: {
          period: projectDate,
          gross: 1,
          net: { $subtract: ["$gross", "$discounts"] }, // ✅ derive net
          _id: 0,
        },
      },
    ]);

    const mapped = agg.map((a) => ({
      period: a.period.toISOString().slice(0, 10),
      gross: Number((a.gross || 0).toFixed(2)),
      net: Number((a.net || 0).toFixed(2)),
    }));

    res.json({
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
      groupBy: groupByMonth ? "month" : "day",
      series: mapped,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Sales by Category
// robust salesByCategory implementation
exports.salesByCategory = async (req, res) => {
  try {
    const { start: startQ, end: endQ } = req.query;
    const { start, end } = parseDates(startQ, endQ, 29);

    const categoryAgg = await Sale.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },

      // Lookup product (may be missing for some sale docs)
      {
        $lookup: {
          from: "products",            // must match actual collection name
          localField: "productId",
          foreignField: "_id",
          as: "product"
        }
      },

      // Keep sales even if product is missing: use $arrayElemAt to get product[0] safely
      {
        $addFields: {
          product0: { $arrayElemAt: ["$product", 0] }
        }
      },

      // Use product0.category if present, otherwise "Uncategorized"
      {
        $group: {
          _id: {
            $ifNull: ["$product0.category", "Uncategorized"]
          },
          gross: { $sum: { $ifNull: ["$totalPrice", 0] } },
          // If you have discount field per sale and want net:
          discounts: { $sum: { $ifNull: ["$discount", 0] } },
          quantity: { $sum: { $ifNull: ["$quantity", 0] } }
        }
      },

      // compute net = gross - discounts
      {
        $project: {
          category: "$_id",
          gross: 1,
          net: { $subtract: ["$gross", "$discounts"] },
          quantity: 1,
          _id: 0
        }
      },

      { $sort: { gross: -1 } }
    ]);

    const mapped = categoryAgg.map(c => ({
      category: c.category || "Uncategorized",
      gross: Number((c.gross || 0).toFixed(2)),
      net: Number((c.net || 0).toFixed(2)),
      quantity: c.quantity || 0
    }));

    // helpful debug logging if nothing came back
    if (!mapped.length) {
      console.warn(`[reports] salesByCategory returned 0 rows for ${start.toISOString().slice(0,10)} -> ${end.toISOString().slice(0,10)}`);
    }

    res.json({
      start: start.toISOString().slice(0,10),
      end: end.toISOString().slice(0,10),
      categories: mapped
    });
  } catch (err) {
    console.error('salesByCategory error:', err);
    res.status(500).json({ message: err.message });
  }
};


