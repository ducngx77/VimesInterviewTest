import { pool } from '../config/db.js';
import { ReceiptFilterParams, ReceiptHistoryDTO } from '@shared/type.js';

export const receiptService = {
  async getHistory(filters: ReceiptFilterParams): Promise<ReceiptHistoryDTO[]> {
    const { fromDate, toDate, supplierId, status, warehouseId } = filters;
    
    let sql = `
      SELECT DISTINCT
        RH.receipt_header_id,
        RH.receipt_no,
        RH.receipt_date,
        RH.total_amount,
        RH.status,
        RH.remark,
        S.company_short_name AS supplier_name,
        W.warehouse_name,
        D.department_short_name,
        WL.location_name
      FROM public.receipt_header RH
      JOIN public.company S ON S.company_id = RH.supplier_id
      JOIN public.warehouse W ON W.warehouse_id = RH.warehouse_id
      JOIN public.department D ON D.department_id = RH.department_id
      JOIN public.wh_location WL ON WL.wh_location_id = RH.location_id
      WHERE RH.enable_flag = true
    `;

    const params: any[] = [];

    if (fromDate) {
      params.push(fromDate);
      sql += ` AND RH.receipt_date >= $${params.length}`;
    }

    if (toDate) {
      params.push(toDate);
      sql += ` AND RH.receipt_date <= $${params.length}`;
    }

    if (supplierId) {
      params.push(supplierId);
      sql += ` AND RH.supplier_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      sql += ` AND RH.status = $${params.length}`;
    }

    if (filters.departmentId) {
      params.push(filters.departmentId);
      sql += ` AND RH.department_id = $${params.length}`;
    }

    sql += ` ORDER BY RH.receipt_date DESC, RH.receipt_no DESC`;

    try {
      const result = await pool.query(sql, params);
      return result.rows; 
    } catch (error) {
      console.error("Database Error in getHistory:", error);
      throw new Error("Cannot load receipt history. Please try again.");
    }
  },

  async getDetail(headerId: number) {
    const sql = `
      SELECT RL.*, I.item_code, I.item_name, U.uom_code
      FROM public.receipt_line RL
      JOIN public.item I ON RL.item_id = I.item_id
      JOIN public.uom U ON RL.uom_id = U.uom_id
      WHERE RL.receipt_header_id = $1 AND RL.enable_flag = true
    `;
    const result = await pool.query(sql, [headerId]);
    console.log('Detail data:', result.rows);
    return result.rows;
  },

  async getSupplier() {
    const sql = `SELECT company_id, company_name, company_code,description
                  FROM public.company
                  WHERE supplier_flag = true
                  AND enable_flag = true`
    const result = await pool.query(sql);
    return result.rows;
  },

  async getWarehouse(departmentId?: number) {
    let sql = `SELECT W.warehouse_id, W.warehouse_name, W.warehouse_code, W.description
        FROM public.warehouse W
        WHERE W.enable_flag = true`;

    const params: any[] = [];

    if (departmentId) {
      sql = `SELECT W.warehouse_id, W.warehouse_name, W.warehouse_code, W.description
        FROM public.warehouse W
        JOIN public.company C ON W.company_id = C.company_id
        JOIN public.department D ON D.company_id = C.company_id
        WHERE W.enable_flag = true AND D.department_id = $1`;
      params.push(departmentId);
    }

    const result = await pool.query(sql, params);
    return result.rows;
  },

  async getWhLocation(warehouseId?: number) {
    let sql = `SELECT WL.wh_location_id, WL.location_name, WL.location_code, WL.description
      FROM public.wh_location WL
      JOIN public.warehouse W ON W.warehouse_id = WL.warehouse_id
      WHERE WL.enable_flag = true`;

    const params: any[] = [];

    if (warehouseId) {
      params.push(warehouseId);
      sql += ` AND WL.warehouse_id = $${params.length}`;
    }  

    const result = await pool.query(sql, params);
    return result.rows;
  },

  async getAccounts() {
    const sql = `SELECT account_id, account_no, account_name, description
                  FROM public.account
                  WHERE enable_flag = true
                  ORDER BY account_no ASC`;
    const result = await pool.query(sql);
    return result.rows;
  },

  async getItems() {
    let sql = `SELECT item_id, item_name, item_code, u.uom_id, u.uom_code, u.uom_name, i.description
                  FROM public.item i
                  LEFT JOIN public.uom u ON u.uom_id = i.uom_id
                  WHERE i.enable_flag = true
                  ORDER BY i.item_code ASC`;
    
    const result = await pool.query(sql);
    return result.rows;
  },

  async createReceipt(payload: { header: any; lines: any[] }) {
    const { header, lines } = payload;
    const client = await pool.connect();
 
    try {
      await client.query('BEGIN');
 
      // insert header
      const totalAmount = lines.reduce(
        (sum: number, l: any) => sum + l.real_quantity * l.item_price, 0
      );
 
      const headerSql = `
        INSERT INTO public.receipt_header (
          company_id, department_id,
          warehouse_id, location_id,
          receipt_date, receipt_no,
          ref_doc_no, ref_date,
          supplier_id, debit_account_id, credit_account_id,
          total_amount, status, remark,
          enable_flag, created_by, created_at
        ) VALUES (
          $1,  $2,
          $3,  $4,
          $5,  $6,
          $7,  $8,
          $9,  $10, $11,
          $12, $13, $14,
          true, $15, NOW()
        )
        RETURNING receipt_header_id
      `;
 
      const headerValues = [
        header.department_id,                
        header.department_id,             
        header.warehouse_id,              
        header.location_id,               
        header.receipt_date,              
        header.receipt_no,                
        header.ref_doc_no  || null,       
        header.ref_date    || null,       
        header.supplier_id,               
        header.debit_account_id,          
        header.credit_account_id,         
        totalAmount,                      
        'draft',                          
        header.remark      || null,       
        header.created_by  || null,       
      ];
 
      const headerResult = await client.query(headerSql, headerValues);
      const receipt_header_id: number = headerResult.rows[0].receipt_header_id;
 
      //insert lines
      const lineSql = `
        INSERT INTO public.receipt_line (
          receipt_header_id,
          warehouse_id, location_id,
          item_id, uom_id,
          receipt_qty, real_quantity,
          item_price, item_amount,
          remark, enable_flag, created_by, created_at
        ) VALUES (
          $1,
          $2,  $3,
          $4,  $5,
          $6,  $7,
          $8,  $9,
          $10, true, $11, NOW()
        )
        RETURNING receipt_line_id
      `;
 
      for (const line of lines) {
        const item_amount = line.real_quantity * line.item_price;
 
        const lineValues = [
          receipt_header_id,                          
          line.warehouse_id || header.warehouse_id,   
          line.location_id  || header.location_id,    
          line.item_id,                                
          line.uom_id,                                
          line.receipt_qty,                           
          line.real_quantity,                         
          line.item_price,                            
          item_amount,                                
          line.remark    || null,                     
          header.created_by || null,                  
        ];
 
        await client.query(lineSql, lineValues);

        await client.query(
          `INSERT INTO public.inventory
            (item_id, warehouse_id, location_id, quantity, reserved_quantity,
              enable_flag, created_by, created_at)
            VALUES ($1, $2, $3, $4, $4, true, $5, NOW())
            ON CONFLICT (item_id, warehouse_id, location_id)
            DO UPDATE SET
              quantity          = inventory.quantity + $4,
              updated_by        = $5,
              updated_at        = NOW()`,
          [line.item_id, line.warehouse_id, line.location_id, line.real_quantity, header.created_by || null]
        );

      }
      // ── 3. Commit ─────────────────────────────────────────────────────
      await client.query('COMMIT');
      return { receipt_header_id, total_amount: totalAmount };
 
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('createReceipt transaction failed, rolled back:', error);
      throw new Error('Cannot create receipt. Please try again.');
    } finally {
      client.release();
    }
  },
};