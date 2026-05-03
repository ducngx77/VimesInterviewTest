import { describe, it, expect, vi, beforeEach } from 'vitest';
import { receiptService } from './receiptService.js';
import { pool } from '../config/db.js';

// Mock DB
vi.mock('../config/db.js', () => ({
  pool: {
    query: vi.fn(),
    connect: vi.fn(),
  },
}));

describe('receiptService FULL TEST', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  // =========================
  // 1. getHistory
  // =========================
  describe('getHistory', () => {

    it('should return data with no filters', async () => {
      const mock = [{ receipt_no: 'R1' }];
      (pool.query as any).mockResolvedValue({ rows: mock });

      const result = await receiptService.getHistory({});

      expect(result).toEqual(mock);

      const [sql, params] = (pool.query as any).mock.calls[0];
      expect(params).toEqual([]);
      expect(sql).toContain('WHERE RH.enable_flag = true');
    });

    it('should apply all filters correctly', async () => {
      (pool.query as any).mockResolvedValue({ rows: [] });

      await receiptService.getHistory({
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
        supplierId: 1,
        status: 'DONE',
        departmentId: 2,
      } as any);

      const [sql, params] = (pool.query as any).mock.calls[0];

      expect(params).toEqual([
        '2024-01-01',
        '2024-12-31',
        1,
        'DONE',
        2
      ]);

      expect(sql).toContain('RH.receipt_date >= $1');
      expect(sql).toContain('RH.receipt_date <= $2');
      expect(sql).toContain('RH.supplier_id = $3');
      expect(sql).toContain('RH.status = $4');
      expect(sql).toContain('RH.department_id = $5');
    });

    it('should throw custom error on DB fail', async () => {
      (pool.query as any).mockRejectedValue(new Error('DB error'));

      await expect(
        receiptService.getHistory({})
      ).rejects.toThrow('Cannot load receipt history. Please try again.');
    });

  });

  // =========================
  // 2. getDetail
  // =========================
  describe('getDetail', () => {

    it('should return detail rows', async () => {
      const mock = [{ item_code: 'A' }];
      (pool.query as any).mockResolvedValue({ rows: mock });

      const result = await receiptService.getDetail(1);

      expect(result).toEqual(mock);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('receipt_line'),
        [1]
      );
    });

  });

  // =========================
  // 3. SIMPLE LIST APIs
  // =========================

  describe('getSupplier', () => {
    it('should return supplier list', async () => {
      (pool.query as any).mockResolvedValue({ rows: ['A'] });

      const result = await receiptService.getSupplier();

      expect(result).toEqual(['A']);
    });
  });

  describe('getWarehouse', () => {
    it('should return all warehouses when no departmentId', async () => {
      (pool.query as any).mockResolvedValue({ rows: [] });

      await receiptService.getWarehouse();

      const [sql, params] = (pool.query as any).mock.calls[0];

      expect(params).toEqual([]);
      expect(sql).not.toContain('JOIN public.department');
    });

    it('should filter by departmentId', async () => {
      (pool.query as any).mockResolvedValue({ rows: [] });

      await receiptService.getWarehouse(10);

      const [sql, params] = (pool.query as any).mock.calls[0];

      expect(params).toEqual([10]);
      expect(sql).toContain('D.department_id = $1');
    });
  });

  describe('getWhLocation', () => {
    it('should filter by warehouseId', async () => {
      (pool.query as any).mockResolvedValue({ rows: [] });

      await receiptService.getWhLocation(5);

      const [sql, params] = (pool.query as any).mock.calls[0];

      expect(params).toEqual([5]);
      expect(sql).toContain('WL.warehouse_id = $1');
    });
  });

  describe('getAccounts', () => {
    it('should return accounts', async () => {
      (pool.query as any).mockResolvedValue({ rows: [] });

      const result = await receiptService.getAccounts();

      expect(result).toEqual([]);
    });
  });

  describe('getItems', () => {
    it('should return items', async () => {
      (pool.query as any).mockResolvedValue({ rows: [] });

      const result = await receiptService.getItems();

      expect(result).toEqual([]);
    });
  });

  // =========================
  // 4. createReceipt (IMPORTANT)
  // =========================

  describe('createReceipt', () => {

    const mockClient = {
      query: vi.fn(),
      release: vi.fn(),
    };

    beforeEach(() => {
      (pool.connect as any).mockResolvedValue(mockClient);
    });

    it('should create receipt successfully and commit', async () => {

      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [{ receipt_header_id: 1 }] }) // header
        .mockResolvedValue({}); // rest

      const payload = {
        header: {
          department_id: 1,
          warehouse_id: 1,
          location_id: 1,
          receipt_date: '2024-01-01',
          receipt_no: 'R1',
          supplier_id: 1,
          debit_account_id: 1,
          credit_account_id: 1,
        },
        lines: [
          {
            item_id: 1,
            uom_id: 1,
            receipt_qty: 1,
            real_quantity: 2,
            item_price: 10,
          }
        ]
      };

      const result = await receiptService.createReceipt(payload as any);

      expect(result.receipt_header_id).toBe(1);
      expect(result.total_amount).toBe(20);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should rollback on error', async () => {

      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockRejectedValueOnce(new Error('fail'));

      const payload = { header: {}, lines: [] };

      await expect(
        receiptService.createReceipt(payload as any)
      ).rejects.toThrow('Cannot create receipt. Please try again.');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should calculate total amount correctly', async () => {

      mockClient.query
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce({ rows: [{ receipt_header_id: 1 }] })
        .mockResolvedValue({});

      const payload = {
        header: {},
        lines: [
          { real_quantity: 2, item_price: 10 },
          { real_quantity: 3, item_price: 5 }
        ]
      };

      const result = await receiptService.createReceipt(payload as any);

      expect(result.total_amount).toBe(2*10 + 3*5);
    });

  });

});