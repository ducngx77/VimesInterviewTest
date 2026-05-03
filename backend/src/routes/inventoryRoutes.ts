import { Router } from 'express';
import { inventoryController } from '../controllers/inventoryController.js';

const router = Router();
router.get('/stock',  inventoryController.getInventory);
export default router;