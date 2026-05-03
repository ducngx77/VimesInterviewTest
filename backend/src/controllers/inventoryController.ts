import { Request, Response } from 'express';
import { inventoryService } from '../services/inventoryService.js';
import { InventoryFilterParams, ReceiptFilterParams } from '@shared/type.js';

export const inventoryController = {
  getInventory: async (req: Request, res: Response) => {
    try {
      const filters: InventoryFilterParams = {
        warehouseId: req.query.warehouseId ? Number(req.query.warehouseId) : undefined,
        locationId: req.query.locationId ? Number(req.query.locationId) : undefined,
        itemSearch: req.query.itemSearch as string
      };

      const data = await inventoryService.getInventory(filters);

      return res.status(200).json(data);
    } catch (error: any) {
      console.error("Error in inventoryController.getInventory:", error);
      
      return res.status(500).json({ 
        message: "An error occurred while loading inventory data.",
        error: error.message 
      });
    }
  },
};