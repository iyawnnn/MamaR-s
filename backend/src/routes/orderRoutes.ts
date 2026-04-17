import { Router } from 'express';
import { 
  createOrder, 
  getOrders, 
  updateOrderStatus, 
  deleteOrder 
} from '../controllers/orderController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.route('/')
  .post(createOrder)
  .get(getOrders);

router.route('/:id/status')
  .patch(updateOrderStatus);

router.route('/:id')
  .delete(deleteOrder);

export default router;