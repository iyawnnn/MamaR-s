import { Request, Response } from 'express';
import Order from '../models/Order';
import InventoryItem from '../models/InventoryItem';
import StockLog from '../models/StockLog';
import { OrderStatus, PaymentStatus } from '../types';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerName, customerContact, items, targetDate, notes, amountPaid } = req.body;

    let totalAmount = 0;
    for (const item of items) {
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
      amountPaid: amountPaid || 0,
      targetDate,
      notes,
      status: OrderStatus.PENDING,
      paymentStatus
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create order', error });
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const orders = await Order.find(filter)
      .populate('items.product', 'name')
      .sort({ targetDate: 1 });
      
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve orders', error });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, amountPaid } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

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

    // Deduct stock only when order transitions to FULFILLED
    if (status === OrderStatus.FULFILLED && order.isModified('status')) {
      for (const item of order.items) {
        const inventoryItem = await InventoryItem.findById(item.product);
        if (inventoryItem) {
          const previousStock = inventoryItem.stock;
          inventoryItem.stock -= item.quantity;
          await inventoryItem.save();

          await StockLog.create({
            productId: inventoryItem._id,
            productName: inventoryItem.name,
            changeType: 'Fulfillment',
            previousStock,
            changeAmount: -item.quantity,
            newStock: inventoryItem.stock,
            date: new Date()
          });
        }
      }
    }

    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order', error });
  }
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(id);
    
    if (!deletedOrder) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete order', error });
  }
};