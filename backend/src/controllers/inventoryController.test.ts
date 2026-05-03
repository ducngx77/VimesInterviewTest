import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { inventoryController } from './inventoryController.js';
import { inventoryService } from '../services/inventoryService.js';

// Mock service
vi.mock('../services/inventoryService', () => ({
  inventoryService: {
    getInventory: vi.fn(),
  },
}));

const app = express();
app.use(express.json());
app.get('/api/inventory', inventoryController.getInventory);

describe('Inventory Controller - getInventory FULL TEST', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================
  // 1. SUCCESS CASE
  // =========================

  it('should return 200 and inventory data on success', async () => {
    const mockData = [
      { item_code: 'MASK', item_name: 'Mask', quantity: 100 }
    ];

    (inventoryService.getInventory as any).mockResolvedValue(mockData);

    const res = await request(app)
      .get('/api/inventory')
      .query({ warehouseId: '1', itemSearch: 'mask' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockData);

    expect(inventoryService.getInventory).toHaveBeenCalledWith({
      warehouseId: 1,
      locationId: undefined,
      itemSearch: 'mask'
    });
  });

  // =========================
  // 2. EMPTY RESULT
  // =========================

  it('should return 200 with empty array when no data', async () => {
    (inventoryService.getInventory as any).mockResolvedValue([]);

    const res = await request(app).get('/api/inventory');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  // =========================
  // 3. DATA PARSING
  // =========================

  it('should convert string IDs to numbers', async () => {
    (inventoryService.getInventory as any).mockResolvedValue([]);

    await request(app).get('/api/inventory?warehouseId=10&locationId=20');

    expect(inventoryService.getInventory).toHaveBeenCalledWith({
      warehouseId: 10,
      locationId: 20,
      itemSearch: undefined
    });
  });

  it('should handle undefined query params correctly', async () => {
    (inventoryService.getInventory as any).mockResolvedValue([]);

    await request(app).get('/api/inventory');

    expect(inventoryService.getInventory).toHaveBeenCalledWith({
      warehouseId: undefined,
      locationId: undefined,
      itemSearch: undefined
    });
  });

  // =========================
  // 4. INVALID NUMBER CASE
  // =========================

  it('should convert invalid number to NaN', async () => {
    (inventoryService.getInventory as any).mockResolvedValue([]);

    await request(app).get('/api/inventory?warehouseId=abc');

    expect(inventoryService.getInventory).toHaveBeenCalledWith({
      warehouseId: NaN,
      locationId: undefined,
      itemSearch: undefined
    });
  });

  // =========================
  // 5. ITEM SEARCH CASE
  // =========================

  it('should pass itemSearch correctly', async () => {
    (inventoryService.getInventory as any).mockResolvedValue([]);

    await request(app).get('/api/inventory?itemSearch=MASK');

    expect(inventoryService.getInventory).toHaveBeenCalledWith({
      warehouseId: undefined,
      locationId: undefined,
      itemSearch: 'MASK'
    });
  });

  it('should handle empty itemSearch string', async () => {
    (inventoryService.getInventory as any).mockResolvedValue([]);

    await request(app).get('/api/inventory?itemSearch=');

    expect(inventoryService.getInventory).toHaveBeenCalledWith({
      warehouseId: undefined,
      locationId: undefined,
      itemSearch: ''
    });
  });

  // =========================
  // 6. ERROR HANDLING
  // =========================

  it('should return 500 when service throws error', async () => {
    (inventoryService.getInventory as any).mockRejectedValue(new Error('DB Error'));

    const res = await request(app).get('/api/inventory');

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("An error occurred while loading inventory data.");
    expect(res.body.error).toBe("DB Error");
  });

  // =========================
  // 7. EDGE CASE
  // =========================

  it('should handle null response from service', async () => {
    (inventoryService.getInventory as any).mockResolvedValue(null);

    const res = await request(app).get('/api/inventory');

    expect(res.status).toBe(200);
    expect(res.body).toBeNull();
  });

  it('should handle large dataset', async () => {
    const bigData = Array.from({ length: 1000 }, (_, i) => ({
      item_code: `ITEM_${i}`,
      quantity: i
    }));

    (inventoryService.getInventory as any).mockResolvedValue(bigData);

    const res = await request(app).get('/api/inventory');

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1000);
  });

  // =========================
  // 8. SECURITY / STRANGE INPUT
  // =========================

  it('should handle SQL injection-like input safely', async () => {
    (inventoryService.getInventory as any).mockResolvedValue([]);

    await request(app).get("/api/inventory?itemSearch=' OR 1=1 --");

    expect(inventoryService.getInventory).toHaveBeenCalled();
  });

  it('should handle XSS-like input safely', async () => {
    (inventoryService.getInventory as any).mockResolvedValue([]);

    await request(app).get("/api/inventory?itemSearch=<script>alert(1)</script>");

    expect(inventoryService.getInventory).toHaveBeenCalled();
  });

  // =========================
  // 9. INTEGRATION BEHAVIOR
  // =========================

  it('should call service exactly once', async () => {
    (inventoryService.getInventory as any).mockResolvedValue([]);

    await request(app).get('/api/inventory');

    expect(inventoryService.getInventory).toHaveBeenCalledTimes(1);
  });

});