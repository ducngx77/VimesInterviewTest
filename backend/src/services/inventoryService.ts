import { pool } from '../config/db.js';
import { InventoryDTO, InventoryFilterParams} from '@shared/type.js';

export const inventoryService = {
  async getInventory(filters: InventoryFilterParams): Promise<InventoryDTO[]> {
    const {  warehouseId, locationId, itemSearch } = filters;
    
    let sql = `
      SELECT 
        i.inv_id,
        it.item_code,
        it.item_name,
        u.uom_code,
        w.warehouse_name,
        l.location_name,
        i.quantity,
        i.reserved_quantity,
        (i.quantity - i.reserved_quantity) as available_quantity
    FROM public.inventory i
    JOIN public.item it ON i.item_id = it.item_id
    JOIN public.uom u ON it.uom_id = u.uom_id
    JOIN public.warehouse w ON i.warehouse_id = w.warehouse_id
    JOIN public.wh_location l ON i.location_id = l.wh_location_id
    WHERE i.enable_flag = true
    `;

    const params: any[] = [];

    if (warehouseId) {
      params.push(warehouseId);
      sql += ` AND i.warehouse_id = $${params.length}`;
    }

    if (locationId) {
      params.push(locationId);
      sql += ` AND i.location_id = $${params.length}`;
    }

    if (itemSearch) {
      params.push(itemSearch);
      sql += ` AND (it.item_code ILIKE $${params.length} OR it.item_name ILIKE $${params.length})`;
    }

    sql += ` ORDER BY it.item_code ASC;`;

    try {
      const result = await pool.query(sql, params);
      return result.rows; 
    } catch (error) {
      console.error("Database Error in getInventory:", error);
      throw new Error("Cannot load inventory data. Please try again.");
    }
  },
};