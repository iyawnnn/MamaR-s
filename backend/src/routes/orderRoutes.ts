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
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  price: z.number().nonnegative("Price cannot be negative").optional(),
});

const createOrderSchema = z.object({
  body: z.object({
    items: z.array(orderItemSchema).min(1, "Order must contain at least one item"),
    paymentStatus: z.string().optional(),
    status: z.string().optional(),
    amountPaid: z.number().nonnegative().optional(),
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

// A PUT request generally replaces the resource, so we validate against the full schema
router.route("/:id")
  .put(validate(createOrderSchema), updateOrder)
  .delete(deleteOrder);

export default router;