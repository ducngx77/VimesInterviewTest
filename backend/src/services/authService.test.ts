import { describe, it, expect, vi, beforeEach } from 'vitest';
import { inventoryService } from './inventoryService.js';
import { pool } from '../config/db.js';

// Mock DB
vi.mock('../config/db.js', () => ({
  pool: {
    query: vi.fn(),
  },
}));

describe('inventoryService - getInventory', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================
  // 1. NO FILTER
  // =========================
  it('should return all inventory when no filters provided', async () => {
    const mockRows = [{ item_code: 'A' }];
    (pool.query as any).mockResolvedValue({ rows: mockRows });

    const result = await inventoryService.getInventory({});

    expect(result).toEqual(mockRows);

    const [sql, params] = (pool.query as any).mock.calls[0];

    expect(params).toEqual([]);
    expect(sql).toContain('WHERE i.enable_flag = true');
    expect(sql).toContain('ORDER BY it.item_code ASC');
  });

  // =========================
  // 2. FILTER warehouseId
  // =========================
  it('should filter by warehouseId', async () => {
    (pool.query as any).mockResolvedValue({ rows: [] });

    await inventoryService.getInventory({ warehouseId: 10 });

    const [sql, params] = (pool.query as any).mock.calls[0];

    expect(params).toEqual([10]);
    expect(sql).toContain('i.warehouse_id = $1');
  });

  // =========================
  // 3. FILTER locationId
  // =========================
  it('should filter by locationId', async () => {
    (pool.query as any).mockResolvedValue({ rows: [] });

    await inventoryService.getInventory({ locationId: 20 });

    const [sql, params] = (pool.query as any).mock.calls[0];

    expect(params).toEqual([20]);
    expect(sql).toContain('i.location_id = $1');
  });

  // =========================
  // 4. FILTER itemSearch
  // =========================
  it('should filter by itemSearch', async () => {
    (pool.query as any).mockResolvedValue({ rows: [] });

    await inventoryService.getInventory({ itemSearch: 'MASK' });

    const [sql, params] = (pool.query as any).mock.calls[0];

    expect(params).toEqual(['MASK']);
    expect(sql).toContain('ILIKE $1');
  });

  // =========================
  // 5. MULTIPLE FILTERS
  // =========================
  it('should build correct param order with multiple filters', async () => {
    (pool.query as any).mockResolvedValue({ rows: [] });

    await inventoryService.getInventory({
      warehouseId: 1,
      locationId: 2,
      itemSearch: 'A'
    });

    const [sql, params] = (pool.query as any).mock.calls[0];

    expect(params).toEqual([1, 2, 'A']);

    expect(sql).toContain('i.warehouse_id = $1');
    expect(sql).toContain('i.location_id = $2');
    expect(sql).toContain('ILIKE $3');
  });

  // =========================
  // 6. PARTIAL FILTERS ORDER
  // =========================
  it('should handle missing middle filter correctly', async () => {
    (pool.query as any).mockResolvedValue({ rows: [] });

    await inventoryService.getInventory({
      warehouseId: 1,
      itemSearch: 'A'
    });

    const [sql, params] = (pool.query as any).mock.calls[0];

    expect(params).toEqual([1, 'A']);

    expect(sql).toContain('i.warehouse_id = $1');
    expect(sql).toContain('ILIKE $2');
  });

  // =========================
  // 7. EMPTY RESULT
  // =========================
  it('should return empty array when no data', async () => {
    (pool.query as any).mockResolvedValue({ rows: [] });

    const result = await inventoryService.getInventory({});

    expect(result).toEqual([]);
  });

  // =========================
  // 8. SQL INJECTION SAFE
  // =========================
  it('should not inject SQL via itemSearch', async () => {
    (pool.query as any).mockResolvedValue({ rows: [] });

    const dangerous = "' OR 1=1 --";

    await inventoryService.getInventory({ itemSearch: dangerous });

    const [sql, params] = (pool.query as any).mock.calls[0];

    expect(params).toContain(dangerous);
    expect(sql).not.toContain(dangerous); // không inline vào SQL
  });

  // =========================
  // 9. ERROR HANDLING
  // =========================
  it('should throw custom error when DB fails', async () => {
    (pool.query as any).mockRejectedValue(new Error('DB crash'));

    await expect(
      inventoryService.getInventory({})
    ).rejects.toThrow("Cannot load inventory data. Please try again.");
  });

  // =========================
  // 10. LARGE PARAM SET
  // =========================
  it('should handle all filters together correctly', async () => {
    (pool.query as any).mockResolvedValue({ rows: [] });

    await inventoryService.getInventory({
      warehouseId: 999,
      locationId: 888,
      itemSearch: 'XYZ'
    });

    const [, params] = (pool.query as any).mock.calls[0];

    expect(params.length).toBe(3);
  });

});