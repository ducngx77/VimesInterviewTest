import React, { useEffect, useState } from "react";
import { inventoryApi } from "../services/inventoryApi";
import {
  InventoryDTO,
  InventoryFilterParams,
  WarehouseDTO,
  WarehouseLocationDTO,
} from "@shared/type";
import { receiptApi } from "../services/receiptApi";

const InventoryStock: React.FC = () => {
  const [stock, setStock] = useState<InventoryDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<InventoryFilterParams>({
    warehouseId: "",
    locationId: "",
    itemSearch: "",
  });

  const [warehouses, setWarehouses] = useState<WarehouseDTO[]>([]);
  const [locations, setLocations] = useState<WarehouseLocationDTO[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const clean: InventoryFilterParams = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== ""),
      );
      const data = await inventoryApi.getStock(clean);
      setStock(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const saved = sessionStorage.getItem("user_session");
      let departmentId = null;
      if (saved) {
        const userData = JSON.parse(saved);
        departmentId = userData.department_id;
      }
      const data = await receiptApi.getWarehouses(departmentId);
      setWarehouses(data);
    } catch (error) {
      console.error("Error retrieving warehouse list:", error);
    }
  };

  const fetchLocations = async (warehouseId?: number) => {
    try {
      const data = await receiptApi.getWarehouseLocations(warehouseId);
      setLocations(data);
    } catch (error) {
      console.error("Error retrieving warehouse locations:", error);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  // Auto-fetch locations when warehouse filter changes
  useEffect(() => {
    if (filters.warehouseId) {
      fetchLocations(Number(filters.warehouseId));
    } else {
      setLocations([]);
      setFilters((prev) => ({ ...prev, locationId: "" }));
    }
  }, [filters.warehouseId]);

  useEffect(() => {
    loadData();
  }, []);

  const handleFilterChange = (
    field: keyof InventoryFilterParams,
    value: string,
  ) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container-fluid animate__animated animate__fadeIn">
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white py-3">
          <h4 className="mb-0 fw-bold text-primary">Current Inventory Stock</h4>
        </div>
        <div className="card-body bg-light-subtle">
          <div className="row g-2 align-items-end">
            <div className="col-md-3">
              <label className="form-label small fw-bold">Search Item</label>
              <input
                type="text"
                className="form-control"
                placeholder="Code or Name..."
                value={filters.itemSearch}
                onChange={(e) =>
                  handleFilterChange("itemSearch", e.target.value)
                }
              />
            </div>

            <div className="col-md-2">
              <label className="form-label small fw-bold">Warehouse</label>
              <select
                className="form-select"
                value={filters.warehouseId}
                onChange={(e) =>
                  handleFilterChange("warehouseId", e.target.value)
                }
              >
                <option value="">All Warehouses</option>
                {warehouses.map((w) => (
                  <option key={w.warehouse_id} value={w.warehouse_id}>
                    {w.warehouse_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label small fw-bold">Location</label>
              <select
                className="form-select"
                value={filters.locationId}
                onChange={(e) =>
                  handleFilterChange("locationId", e.target.value)
                }
                disabled={!filters.warehouseId}
              >
                <option value="">All Locations</option>
                {locations.map((l) => (
                  <option key={l.wh_location_id} value={l.wh_location_id}>
                    {l.location_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <button
                className="btn btn-primary w-100"
                onClick={loadData}
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  "Search"
                )}
              </button>
            </div>

            <div className="col-md-1">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() =>
                  setFilters({
                    warehouseId: "",
                    locationId: "",
                    itemSearch: "",
                  })
                }
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Item Code</th>
                <th>Item Name</th>
                <th>UoM</th>
                <th>Warehouse</th>
                <th>Location</th>
                <th className="text-end">On-Hand Qty</th>
                <th className="text-end">Reserved</th>
                <th className="text-end text-success">Available</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-5">
                    Loading stock data...
                  </td>
                </tr>
              ) : stock.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    No inventory found.
                  </td>
                </tr>
              ) : (
                stock.map((row) => (
                  <tr key={row.inv_id}>
                    <td className="fw-bold text-primary">{row.item_code}</td>
                    <td>{row.item_name}</td>
                    <td className="text-center">
                      <span className="badge bg-light text-dark border">
                        {row.uom_code}
                      </span>
                    </td>
                    <td>{row.warehouse_name}</td>
                    <td>
                      <small className="text-muted">{row.location_name}</small>
                    </td>
                    <td className="text-end fw-semibold">
                      {row.quantity.toLocaleString()}
                    </td>
                    <td className="text-end text-danger">
                      {row.reserved_quantity.toLocaleString()}
                    </td>
                    <td className="text-end fw-bold text-success">
                      {(row.quantity - row.reserved_quantity).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryStock;
