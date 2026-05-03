import { Request, Response } from 'express';
import { receiptService } from '../services/receiptService.js';
import { ReceiptFilterParams } from '@shared/type.js';
import { create } from 'node:domain';

export const receiptController = {
  getHistory: async (req: Request, res: Response) => {
    try {
      const filters: ReceiptFilterParams = {
        fromDate: req.query.fromDate as string,
        toDate: req.query.toDate as string,
        supplierId: req.query.supplierId ? Number(req.query.supplierId) : undefined,
        status: req.query.status as string,
        warehouseId: req.query.warehouseId ? Number(req.query.warehouseId) : undefined
      };

      const data = await receiptService.getHistory(filters);

      return res.status(200).json(data);
    } catch (error: any) {
      console.error("Error in receiptController.getHistory:", error);
      
      return res.status(500).json({ 
        message: "An error occurred while loading warehouse receipt history.",
        error: error.message 
      });
    }
  },

  getDetail: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ message: "Missing receipt ID." });
      }

      const headerId = Number(id);
      if (isNaN(headerId)) {
        return res.status(400).json({ message: "Invalid receipt ID." });
      }

      const lines = await receiptService.getDetail(headerId);
      return res.status(200).json(lines);
    } catch (error: any) {
      console.error("Error in getDetail:", error);
      return res.status(500).json({ message: "Error while retrieving receipt details." });
    }
  },

  getSupplier: async (req: Request, res: Response) => {
    try {
      const data = await receiptService.getSupplier();
      return res.status(200).json(data);
    } catch (error: any) {
      console.error("Error in receiptController.getSupplier:", error);
      
      return res.status(500).json({ 
        message: "An error occurred while retrieving the supplier list.",
        error: error.message 
      });
    }
  },

  getWarehouse: async (req: Request, res: Response) => {
    try {
      const departmentId = req.query.department_id ? Number(req.query.department_id) : undefined;
      const data = await receiptService.getWarehouse(departmentId);
      return res.status(200).json(data);
    } catch (error: any) {
      console.error("Error in receiptController.getWarehouse:", error);
      
      return res.status(500).json({ 
        message: "An error occurred while retrieving the warehouse list.",
        error: error.message 
      });
    }
  },

  getWhLocation: async (req: Request, res: Response) => {
    try {
      const warehouseId = req.query.warehouse_id ? Number(req.query.warehouse_id) : undefined;
      const data = await receiptService.getWhLocation(warehouseId);
      return res.status(200).json(data);
    } catch (error: any) {
      console.error("Error in receiptController.getWhLocation:", error);
      
      return res.status(500).json({ 
        message: "An error occurred while retrieving the warehouse location list.",
        error: error.message 
      });
    }
  },

  getAccounts: async (req: Request, res: Response) => {
    try {
      const data = await receiptService.getAccounts();
      return res.status(200).json(data);
    } catch (error: any) {
      console.error("Error in receiptController.getAccounts:", error);
      
      return res.status(500).json({ 
        message: "An error occurred while retrieving the account list.",
        error: error.message 
      });
    }
  },

  getItems: async (req: Request, res: Response) => {
    try {
      const data = await receiptService.getItems();
      return res.status(200).json(data);
    } catch (error: any) {
      console.error("Error in receiptController.getItems:", error);
      
      return res.status(500).json({ 
        message: "An error occurred while retrieving the item list.",
        error: error.message 
      });
    }
  },

  createReceipt: async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const result = await receiptService.createReceipt(payload);
      return res.status(201).json(result);
    } catch (error: any) {
      console.error("Error in receiptController.create:", error);
    return res.status(500).json({ 
      message: error.message,
      detail: error.detail ?? null 
    });
    }
  },
};