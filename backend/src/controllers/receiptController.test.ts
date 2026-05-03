import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { receiptController } from './receiptController.js';
import { receiptService } from '../services/receiptService.js';

// Mock service
vi.mock('../services/receiptService.js', () => ({
  receiptService: {
    getHistory: vi.fn(),
    getDetail: vi.fn(),
    getSupplier: vi.fn(),
    getWarehouse: vi.fn(),
    getWhLocation: vi.fn(),
    getAccounts: vi.fn(),
    getItems: vi.fn(),
    createReceipt: vi.fn(),
  },
}));

const app = express();
app.use(express.json());

// Routes
app.get('/api/receipts', receiptController.getHistory);
app.get('/api/receipts/:id', receiptController.getDetail);
app.post('/api/receipts', receiptController.createReceipt);
app.get('/api/suppliers', receiptController.getSupplier);
app.get('/api/warehouses', receiptController.getWarehouse);
app.get('/api/locations', receiptController.getWhLocation);
app.get('/api/accounts', receiptController.getAccounts);
app.get('/api/items', receiptController.getItems);

describe('Receipt Controller FULL TEST', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================
  // 1. getHistory
  // =========================
  describe('getHistory', () => {

    it('should return 200 with data', async () => {
      const mock = [{ receipt_no: 'RC001' }];
      (receiptService.getHistory as any).mockResolvedValue(mock);

      const res = await request(app)
        .get('/api/receipts')
        .query({ supplierId: '10', warehouseId: '5', status: 'DONE' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mock);

      expect(receiptService.getHistory).toHaveBeenCalledWith({
        fromDate: undefined,
        toDate: undefined,
        supplierId: 10,
        status: 'DONE',
        warehouseId: 5
      });
    });

    it('should handle empty query params', async () => {
      (receiptService.getHistory as any).mockResolvedValue([]);

      await request(app).get('/api/receipts');

      expect(receiptService.getHistory).toHaveBeenCalledWith({
        fromDate: undefined,
        toDate: undefined,
        supplierId: undefined,
        status: undefined,
        warehouseId: undefined
      });
    });

    it('should convert invalid number to NaN', async () => {
      (receiptService.getHistory as any).mockResolvedValue([]);

      await request(app).get('/api/receipts?supplierId=abc');

      expect(receiptService.getHistory).toHaveBeenCalledWith(
        expect.objectContaining({
          supplierId: NaN
        })
      );
    });

    it('should return 500 on error', async () => {
      (receiptService.getHistory as any).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/receipts');

      expect(res.status).toBe(500);
      expect(res.body.message).toContain('warehouse receipt history');
    });
  });

  // =========================
  // 2. getDetail
  // =========================
  describe('getDetail', () => {

    it('should return 200 with valid id', async () => {
      (receiptService.getDetail as any).mockResolvedValue([{ id: 1 }]);

      const res = await request(app).get('/api/receipts/123');

      expect(res.status).toBe(200);
      expect(receiptService.getDetail).toHaveBeenCalledWith(123);
    });

    it('should return 400 if id is NaN', async () => {
      const res = await request(app).get('/api/receipts/abc');

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid receipt ID.");
      expect(receiptService.getDetail).not.toHaveBeenCalled();
    });

    it('should return 500 if service fails', async () => {
      (receiptService.getDetail as any).mockRejectedValue(new Error('fail'));

      const res = await request(app).get('/api/receipts/1');

      expect(res.status).toBe(500);
    });
  });

  // =========================
  // 3. MASTER DATA APIs
  // =========================

  describe('getSupplier', () => {
    it('should return supplier list', async () => {
      (receiptService.getSupplier as any).mockResolvedValue(['A', 'B']);

      const res = await request(app).get('/api/suppliers');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });

    it('should return 500 on error', async () => {
      (receiptService.getSupplier as any).mockRejectedValue(new Error('err'));

      const res = await request(app).get('/api/suppliers');

      expect(res.status).toBe(500);
    });
  });

  describe('getWarehouse', () => {
    it('should parse department_id correctly', async () => {
      (receiptService.getWarehouse as any).mockResolvedValue([]);

      await request(app).get('/api/warehouses?department_id=5');

      expect(receiptService.getWarehouse).toHaveBeenCalledWith(5);
    });

    it('should handle undefined department_id', async () => {
      (receiptService.getWarehouse as any).mockResolvedValue([]);

      await request(app).get('/api/warehouses');

      expect(receiptService.getWarehouse).toHaveBeenCalledWith(undefined);
    });
  });

  describe('getWhLocation', () => {
    it('should parse warehouse_id correctly', async () => {
      (receiptService.getWhLocation as any).mockResolvedValue([]);

      await request(app).get('/api/locations?warehouse_id=2');

      expect(receiptService.getWhLocation).toHaveBeenCalledWith(2);
    });
  });

  describe('getAccounts', () => {
    it('should return accounts', async () => {
      (receiptService.getAccounts as any).mockResolvedValue(['acc']);

      const res = await request(app).get('/api/accounts');

      expect(res.status).toBe(200);
    });

    it('should handle error', async () => {
      (receiptService.getAccounts as any).mockRejectedValue(new Error());

      const res = await request(app).get('/api/accounts');

      expect(res.status).toBe(500);
    });
  });

  describe('getItems', () => {
    it('should return items', async () => {
      (receiptService.getItems as any).mockResolvedValue(['item']);

      const res = await request(app).get('/api/items');

      expect(res.status).toBe(200);
    });

    it('should handle error', async () => {
      (receiptService.getItems as any).mockRejectedValue(new Error());

      const res = await request(app).get('/api/items');

      expect(res.status).toBe(500);
    });
  });

  // =========================
  // 4. createReceipt
  // =========================

  describe('createReceipt', () => {

    it('should return 201 on success', async () => {
      const payload = { receipt_no: 'NEW' };
      const mock = { id: 1 };

      (receiptService.createReceipt as any).mockResolvedValue(mock);

      const res = await request(app)
        .post('/api/receipts')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(mock);
    });

    it('should pass payload correctly', async () => {
      const payload = { receipt_no: 'TEST' };

      (receiptService.createReceipt as any).mockResolvedValue({});

      await request(app)
        .post('/api/receipts')
        .send(payload);

      expect(receiptService.createReceipt).toHaveBeenCalledWith(payload);
    });

    it('should return 500 on error', async () => {
      (receiptService.createReceipt as any).mockRejectedValue({
        message: 'fail',
        detail: 'sql error'
      });

      const res = await request(app)
        .post('/api/receipts')
        .send({});

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('fail');
      expect(res.body.detail).toBe('sql error');
    });
  });

});