import { Request, Response } from "express";
import Order from "../models/Order.js";
import Product from "../models/InventoryItem.js";
import StockLog from "../models/StockLog.js";
import { OrderStatus, PaymentStatus } from "../types/index.js";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const {
      customerName,
      customerContact,
      items,
      amountPaid = 0,
      targetDate,
      notes
    } = req.body;

    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }
      totalAmount += item.quantity * item.priceAtTimeOfOrder;
    }

    let paymentStatus = PaymentStatus.UNPAID;
    if (amountPaid >= totalAmount) {
      paymentStatus = PaymentStatus.PAID;
    } else if (amountPaid > 0) {
      paymentStatus = PaymentStatus.PARTIAL;
    }

    const order = new Order({
      customerName,
      customerContact,
      items,
      totalAmount,
      amountPaid,
      targetDate,
      notes,
      status: OrderStatus.PENDING,
      paymentStatus
    });

    await order.save();
    res.status(201).json({ message: "Order created", order });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const orders = await Order.find(filter)
      .populate("items.product", "name hasVariants variants")
      .sort({ targetDate: 1 });
      
    res.status(200).json(orders);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, amountPaid } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const previousStatus = order.status;

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    
    if (amountPaid !== undefined) {
      order.amountPaid = amountPaid;
      if (order.amountPaid >= order.totalAmount) {
        order.paymentStatus = PaymentStatus.PAID;
      } else if (order.amountPaid > 0) {
        order.paymentStatus = PaymentStatus.PARTIAL;
      } else {
        order.paymentStatus = PaymentStatus.UNPAID;
      }
    }

    // Only reduce inventory when moving into FULFILLED state
    if (status === OrderStatus.FULFILLED && previousStatus !== OrderStatus.FULFILLED) {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        
        if (product) {
          const previousStock = product.stock;
          
          if (product.stock < item.quantity) {
             return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
          }

          product.stock -= item.quantity;
          await product.save();

          await new StockLog({
            productId: product._id,
            productName: product.name,
            changeType: "Fulfillment",
            previousStock,
            changeAmount: -item.quantity,
            newStock: product.stock,
            date: new Date()
          }).save();
        }
      }
    }

    await order.save();
    res.status(200).json({ message: "Order updated", order });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(id);
    
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};