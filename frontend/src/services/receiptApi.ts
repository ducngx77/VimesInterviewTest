import { ReceiptHistoryDTO, ReceiptFilterParams } from "@shared/type.js";
import.meta.env.VITE_API_BASE_URL;

const API_URL = import.meta.env.VITE_API_BASE_URL + "/receipt";

export const receiptApi = {
  getHistory: async (
    filters: ReceiptFilterParams,
  ): Promise<ReceiptHistoryDTO[]> => {
    const query = new URLSearchParams(filters as any).toString();
    const response = await fetch(`${API_URL}/history?${query}`);

    if (!response.ok) throw new Error("Error fetching receipt history");
    return response.json();
  },

  getDetail: async (id: number): Promise<any> => {
    const response = await fetch(`${API_URL}/detail/${id}`);
    console.log("Response from getDetail:", response);
    if (!response.ok) throw new Error("Error retrieving receipt detail");
    return response.json();
  },

  getSupplier: async (): Promise<any> => {
    const response = await fetch(`${API_URL}/suppliers`);
    if (!response.ok) throw new Error("Error retrieving supplier list");
    return response.json();
  },

  getWarehouses: async (departmentId?: number): Promise<any> => {
    const url = departmentId
      ? `${API_URL}/warehouse?department_id=${departmentId}`
      : `${API_URL}/warehouse`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error retrieving warehouse list");
    return response.json();
  },

  getWarehouseLocations: async (warehouseId?: number): Promise<any> => {
    const url = warehouseId
      ? `${API_URL}/wh-location?warehouse_id=${warehouseId}`
      : `${API_URL}/wh-location`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error retrieving warehouse location list");
    return response.json();
  },

  getAccounts: async (): Promise<any> => {
    const response = await fetch(`${API_URL}/accounts`);
    if (!response.ok) throw new Error("Error retrieving account list");
    return response.json();
  },

  getItems: async (): Promise<any> => {
    const url = `${API_URL}/items`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error retrieving item list");
    return response.json();
  },

  createReceipt: async (payload: {
    header: any;
    lines: any[];
  }): Promise<any> => {
    const response = await fetch(`${API_URL}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.message ?? "Error creating receipt");
    }
    return response.json();
  },
};
