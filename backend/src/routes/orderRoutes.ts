import { Router } from "express";
import { 
  createOrder, 
  getOrders, 
  updateOrder,
  updateOrderStatus, 
  deleteOrder 
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

router.route("/")
  .post(createOrder)
  .get(getOrders);

router.route("/:id/status")
  .patch(updateOrderStatus);

router.route("/:id")
  .put(updateOrder)
  .delete(deleteOrder);

export default router;