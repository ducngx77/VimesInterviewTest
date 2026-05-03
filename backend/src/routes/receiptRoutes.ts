import { Router } from 'express';
import { receiptController } from '../controllers/receiptController.js';

const router = Router();
router.get('/history',  receiptController.getHistory);
router.get('/suppliers', receiptController.getSupplier);
router.get('/warehouse', receiptController.getWarehouse);
router.get('/wh-location', receiptController.getWhLocation);
router.get('/accounts', receiptController.getAccounts);
router.get('/items', receiptController.getItems);

router.post('/create', receiptController.createReceipt);

router.get('/detail/:id', receiptController.getDetail);
export default router;