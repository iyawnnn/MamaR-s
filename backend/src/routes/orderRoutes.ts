import { Router } from "express";
import { z } from "zod";
import { 
  createOrder, 
  getOrders, 
  updateOrder,
  updateOrderStatus, 
  deleteOrder 
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const orderItemSchema = z.object({
  product: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  priceAtTimeOfOrder: z.number().nonnegative("Price cannot be negative"),
});

const createOrderSchema = z.object({
  body: z.object({
    customerName: z.string().optional(),
    customerContact: z.string().optional(),
    items: z.array(orderItemSchema).min(1, "Order must contain at least one item"),
    amountPaid: z.number().nonnegative().optional(),
    targetDate: z.string().optional(),
    notes: z.string().optional()
  }),
});

const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.string().optional(),
    paymentStatus: z.string().optional(),
    amountPaid: z.number().nonnegative().optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: "At least one update field must be provided",
  }),
});

router.use(protect);

router.route("/")
  .post(validate(createOrderSchema), createOrder)
  .get(getOrders);

router.route("/:id/status")
  .patch(validate(updateOrderStatusSchema), updateOrderStatus);

router.route("/:id")
  .put(validate(createOrderSchema), updateOrder)
  .delete(deleteOrder);

export default router;