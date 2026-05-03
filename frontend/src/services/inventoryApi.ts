import { InventoryDTO, InventoryFilterParams } from "@shared/type.js";
import.meta.env.VITE_API_BASE_URL;

const API_URL = import.meta.env.VITE_API_BASE_URL + "/inventory";

export const inventoryApi = {
  getStock: async (params: InventoryFilterParams): Promise<InventoryDTO[]> => {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`${API_URL}/stock?${query}`);
    if (!response.ok) throw new Error("Error fetching inventory stock");
    return response.json();
  },
};
