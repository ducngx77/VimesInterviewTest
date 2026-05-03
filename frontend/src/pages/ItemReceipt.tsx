import { useState, useEffect } from "react";
import { receiptApi } from "../services/receiptApi";
import {
  AccountDTO,
  ItemDTO,
  ReceiptLineDTO,
  SupplierDTO,
  WarehouseDTO,
  WarehouseLocationDTO,
} from "@shared/type";

const ItemReceipt = () => {
  const [user, setUser] = useState<any>(null);
  const [suppliers, setSuppliers] = useState<SupplierDTO[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseDTO[]>([]);
  const [locations, setLocations] = useState<WarehouseLocationDTO[]>([]);
  const [accounts, setAccounts] = useState<AccountDTO[]>([]);
  const [items, setItems] = useState<ItemDTO[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [header, setHeader] = useState({
    receipt_date: new Date().toISOString().split("T")[0],
    receipt_no: "",
    ref_doc_no: "",
    ref_date: new Date().toISOString().split("T")[0],
    supplier_id: "",
    warehouse_id: "",
    location_id: "",
    debit_account_id: "",
    credit_account_id: "",
    remark: "",
    company_id: 1,
    department_id: 0,
    created_by: "",
    created_at: "",
  });

  const emptyLine = (): ReceiptLineDTO => ({
    _tempId: Date.now(),
    receipt_line_id: null,
    receipt_header_id: null,
    warehouse_id: "",
    location_id: "",
    item_id: "",
    uom_id: "",
    uom_code: "",
    uom_name: "",
    receipt_qty: 0,
    real_quantity: 0,
    item_price: 0,
    item_amount: 0,
    remark: "",
    enable_flag: true,
  });

  const [lines, setLines] = useState<ReceiptLineDTO[]>([emptyLine()]);

  // get user session on mount to pre-fill department_id in header
  useEffect(() => {
    const saved = sessionStorage.getItem("user_session");
    if (saved) {
      try {
        const userData = JSON.parse(saved);
        setUser(userData);
        setHeader((prev) => ({
          ...prev,
          department_id: userData.department_id,
        }));
      } catch (e) {
        console.error("Error parsing user session:", e);
      }
    }
  }, []);

  // get data for dropdowns
  const fetchSuppliers = async () => {
    try {
      const data = await receiptApi.getSupplier();
      setSuppliers(data);
    } catch (error) {
      console.error("Error retrieving supplier list:", error);
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
      if (data.length > 0) {
        setHeader((prev) => ({
          ...prev,
          warehouse_id: String(data[0].warehouse_id),
        }));
      }
    } catch (error) {
      console.error("Error retrieving warehouse list:", error);
    }
  };

  const fetchLocations = async (warehouseId?: number) => {
    try {
      const data = await receiptApi.getWarehouseLocations(warehouseId);
      setLocations(data);
      if (data.length > 0) {
        setHeader((prev) => ({
          ...prev,
          location_id: String(data[0].wh_location_id),
        }));
      }
    } catch (error) {
      console.error("Error retrieving warehouse locations:", error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const data = await receiptApi.getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error("Error retrieving accounts:", error);
    }
  };

  const fetchItems = async () => {
    try {
      const data = await receiptApi.getItems();
      setItems(data);
    } catch (error) {
      console.error("Error retrieving items:", error);
    }
  };

  // load all dropdown data on mount
  useEffect(() => {
    fetchSuppliers();
    fetchWarehouses();
    fetchLocations();
    fetchAccounts();
    fetchItems();
  }, []);

  useEffect(() => {
    if (header.warehouse_id) {
      fetchLocations(Number(header.warehouse_id));
    }
  }, [header.warehouse_id]);

  // line logic
  const handleItemChange = (index: number, invId: string) => {
    const selected = items.find((i) => String(i.item_id) === invId);

    setLines((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        item_id: invId,
        uom_id: selected ? String(selected.uom_id) : "",
        uom_code: selected?.uom_code ?? "",
      };
      return updated;
    });
  };

  const handleReceiptQtyChange = (index: number, value: number) => {
    setLines((prev) => {
      const updated = [...prev];
      const line = { ...updated[index] };
      line.receipt_qty = value;
      if (!line.real_quantity) {
        line.real_quantity = value;
      }
      line.item_amount = line.real_quantity * line.item_price;
      updated[index] = line;
      return updated;
    });
  };

  const handleLineChange = (
    index: number,
    field: keyof ReceiptLineDTO,
    value: string | number | boolean,
  ) => {
    setLines((prev) => {
      const updated = [...prev];
      const line = { ...updated[index], [field]: value };
      line.item_amount = line.real_quantity * line.item_price;
      updated[index] = line;
      return updated;
    });
  };

  const handleAddLine = () => {
    setLines((prev) => [...prev, emptyLine()]);
  };

  const handleDeleteLine = (_tempId: number) => {
    setLines((prev) => prev.filter((l) => l._tempId !== _tempId));
  };

  // validation logic
  const validate = (): string[] => {
    const errs: string[] = [];

    if (!header.receipt_no.trim()) errs.push("Receipt No is required.");
    if (!header.receipt_date) errs.push("Receipt Date is required.");
    if (!header.supplier_id) errs.push("Supplier is required.");
    if (!header.warehouse_id) errs.push("Warehouse is required.");
    if (!header.location_id) errs.push("Location is required.");
    if (!header.debit_account_id) errs.push("Debit Account is required.");
    if (!header.credit_account_id) errs.push("Credit Account is required.");

    // A valid line must have: item selected, receipt_qty > 0, real_quantity > 0, item_price > 0
    const validLines = lines.filter(
      (l) =>
        l.item_id &&
        l.receipt_qty > 0 &&
        l.real_quantity > 0 &&
        l.item_price > 0,
    );
    if (validLines.length === 0) {
      errs.push(
        "At least one complete item line (item, receipt qty, real qty, price) is required.",
      );
    }

    return errs;
  };

  const isFormValid =
    !!header.receipt_no.trim() &&
    !!header.receipt_date &&
    !!header.supplier_id &&
    !!header.warehouse_id &&
    !!header.location_id &&
    !!header.debit_account_id &&
    !!header.credit_account_id &&
    lines.every(
      (l) =>
        l.item_id &&
        l.receipt_qty > 0 &&
        l.real_quantity > 0 &&
        l.item_price > 0,
    );

  // submission logic
  const handleSubmit = async () => {
    setErrors([]);

    const validationErrors = validate();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const validLines = lines
      .filter(
        (l) =>
          l.item_id &&
          l.receipt_qty > 0 &&
          l.real_quantity > 0 &&
          l.item_price > 0,
      )
      .map(({ _tempId, uom_code, uom_name, ...rest }) => ({
        ...rest,
        item_id: Number(rest.item_id),
        uom_id: Number(rest.uom_id),
        warehouse_id: Number(rest.warehouse_id) || Number(header.warehouse_id),
        location_id: Number(rest.location_id) || Number(header.location_id),
      }));

    const payload = {
      header: {
        receipt_no: header.receipt_no,
        receipt_date: header.receipt_date,
        ref_doc_no: header.ref_doc_no,
        ref_date: header.ref_date,
        supplier_id: Number(header.supplier_id),
        warehouse_id: Number(header.warehouse_id),
        location_id: Number(header.location_id),
        debit_account_id: Number(header.debit_account_id),
        credit_account_id: Number(header.credit_account_id),
        remark: header.remark,
        company_id: header.company_id,
        department_id: header.department_id,
      },
      lines: validLines,
    };

    try {
      setSubmitting(true);
      await receiptApi.createReceipt(payload);
      alert("Receipt created successfully!");
      // Reset form after success
      setLines([emptyLine()]);
      setHeader((prev) => ({
        ...prev,
        receipt_no: "",
        ref_doc_no: "",
        ref_date: new Date().toISOString().split("T")[0],
        supplier_id: "",
        debit_account_id: "",
        credit_account_id: "",
        remark: "",
      }));
    } catch (error: any) {
      console.error("❌ Full error:", error);
      console.log("📦 Payload sent:", JSON.stringify(payload, null, 2));
      setErrors([
        error?.message ?? "Failed to create receipt. Please try again.",
      ]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  const totalAmount = lines.reduce((sum, l) => sum + l.item_amount, 0);

  return (
    <div className="container-fluid animate__animated animate__fadeIn">
      {errors.length > 0 && (
        <div
          className="alert alert-danger alert-dismissible fade show mb-3"
          role="alert"
        >
          <strong>Please fix the following:</strong>
          <ul className="mb-0 mt-1">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
          <button
            type="button"
            className="btn-close"
            onClick={() => setErrors([])}
          />
        </div>
      )}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h4 className="mb-0 fw-bold text-primary">Receipt Header</h4>
          {header.created_by && (
            <small className="text-muted">
              Created by: <strong>{header.created_by}</strong> on{" "}
              {new Date(header.created_at).toLocaleString()}
            </small>
          )}
        </div>

        <div className="card-body bg-light-subtle">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small fw-bold">
                Receipt No <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={header.receipt_no}
                onChange={(e) =>
                  setHeader({ ...header, receipt_no: e.target.value })
                }
                required
              />
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-bold">
                Receipt Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                value={header.receipt_date}
                onChange={(e) =>
                  setHeader({ ...header, receipt_date: e.target.value })
                }
                required
              />
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-bold">
                Debit Account <span className="text-danger">*</span>
              </label>
              <select
                className={`form-select ${!header.debit_account_id ? "text-muted" : ""}`}
                value={header.debit_account_id}
                onChange={(e) =>
                  setHeader({ ...header, debit_account_id: e.target.value })
                }
                required
              >
                <option value="" className="text-muted" disabled>
                  -- Select Debit Account --
                </option>
                {accounts.map((a) => (
                  <option
                    key={a.account_id}
                    value={a.account_id}
                    className="text-body"
                  >
                    {a.account_no} - {a.account_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-bold">
                Credit Account <span className="text-danger">*</span>
              </label>
              <select
                className={`form-select ${!header.credit_account_id ? "text-muted" : ""}`}
                value={header.credit_account_id}
                onChange={(e) =>
                  setHeader({ ...header, credit_account_id: e.target.value })
                }
                required
              >
                <option value="" className="text-muted" disabled>
                  -- Select Credit Account --
                </option>
                {accounts.map((a) => (
                  <option
                    key={a.account_id}
                    value={a.account_id}
                    className="text-body"
                  >
                    {a.account_no} - {a.account_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-bold">
                Reference Document No
              </label>
              <input
                type="text"
                className="form-control"
                value={header.ref_doc_no}
                onChange={(e) =>
                  setHeader({ ...header, ref_doc_no: e.target.value })
                }
              />
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-bold">Reference Date</label>
              <input
                type="date"
                className="form-control"
                value={header.ref_date}
                onChange={(e) =>
                  setHeader({ ...header, ref_date: e.target.value })
                }
              />
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-bold">
                Warehouse <span className="text-danger">*</span>
              </label>
              <select
                className={`form-select ${!header.warehouse_id ? "text-muted" : ""}`}
                value={header.warehouse_id}
                onChange={(e) =>
                  setHeader({ ...header, warehouse_id: e.target.value })
                }
                required
              >
                <option value="" className="text-muted" disabled>
                  -- Select Warehouse --
                </option>
                {warehouses.map((w) => (
                  <option
                    key={w.warehouse_id}
                    value={w.warehouse_id}
                    className="text-body"
                  >
                    {w.warehouse_code} - {w.warehouse_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-bold">
                Location <span className="text-danger">*</span>
              </label>
              <select
                className={`form-select ${!header.location_id ? "text-muted" : ""}`}
                value={header.location_id}
                onChange={(e) =>
                  setHeader({ ...header, location_id: e.target.value })
                }
                required
              >
                <option value="" className="text-muted" disabled>
                  -- Select Location --
                </option>
                {locations.map((l) => (
                  <option
                    key={l.wh_location_id}
                    value={l.wh_location_id}
                    className="text-body"
                  >
                    {l.location_code} - {l.location_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-bold">
                Supplier <span className="text-danger">*</span>
              </label>
              <select
                className={`form-select ${!header.supplier_id ? "text-muted" : ""}`}
                value={header.supplier_id}
                onChange={(e) =>
                  setHeader({ ...header, supplier_id: e.target.value })
                }
                required
              >
                <option value="" className="text-muted" disabled>
                  -- Select Supplier --
                </option>
                {suppliers.map((s) => (
                  <option
                    key={s.company_id}
                    value={s.company_id}
                    className="text-body"
                  >
                    {s.company_code} - {s.company_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-9">
              <label className="form-label small fw-bold">Remarks</label>
              <textarea
                className="form-control"
                rows={1}
                value={header.remark}
                onChange={(e) =>
                  setHeader({ ...header, remark: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h4 className="mb-0 fw-bold text-success">Item Lines</h4>
          <button className="btn btn-sm btn-success" onClick={handleAddLine}>
            + Add Line
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ minWidth: 220 }}>
                  Item - Item Code <span className="text-danger">*</span>
                </th>
                <th style={{ width: 80 }} className="text-center">
                  UOM
                </th>
                <th style={{ width: 120 }} className="text-end">
                  Receipt Qty <span className="text-danger">*</span>
                </th>
                <th style={{ width: 120 }} className="text-end">
                  Real Qty <span className="text-danger">*</span>
                </th>
                <th style={{ width: 90 }} className="text-center">
                  Diff
                </th>
                <th style={{ width: 140 }} className="text-end">
                  Item Price <span className="text-danger">*</span>
                </th>
                <th style={{ width: 150 }} className="text-end">
                  Item Amount
                </th>
                <th>Remark</th>
                <th style={{ width: 44 }} />
              </tr>
            </thead>

            <tbody>
              {lines.map((line, index) => {
                const diff = line.real_quantity - line.receipt_qty;
                const diffColor =
                  diff === 0
                    ? "text-muted"
                    : diff > 0
                      ? "text-danger"
                      : "text-warning";
                const diffLabel =
                  diff === 0
                    ? "—"
                    : (diff > 0 ? "+" : "") + diff.toLocaleString();

                // Highlight row if item is selected but required numeric fields are still 0
                const isIncomplete =
                  !!line.item_id &&
                  (line.receipt_qty <= 0 ||
                    line.real_quantity <= 0 ||
                    line.item_price <= 0);

                return (
                  <tr
                    key={line._tempId}
                    className={isIncomplete ? "table-warning" : ""}
                  >
                    <td>
                      <select
                        className={`form-select form-select-sm ${!line.item_id ? "text-muted" : ""}`}
                        value={line.item_id}
                        onChange={(e) =>
                          handleItemChange(index, e.target.value)
                        }
                      >
                        <option value="" disabled className="text-muted">
                          -- Select Item --
                        </option>
                        {items.map((i) => (
                          <option
                            key={i.item_id}
                            value={i.item_id}
                            className="text-body"
                          >
                            {i.item_code} - {i.item_name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm text-center"
                        value={line.uom_code}
                        readOnly
                        tabIndex={-1}
                        style={{ background: "#f8f9fa", cursor: "default" }}
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        min={0}
                        className="form-control form-control-sm text-end"
                        value={line.receipt_qty}
                        onChange={(e) =>
                          handleReceiptQtyChange(
                            index,
                            Math.max(0, Number(e.target.value)),
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        min={0}
                        className="form-control form-control-sm text-end border-primary"
                        value={line.real_quantity}
                        onChange={(e) =>
                          handleLineChange(
                            index,
                            "real_quantity",
                            Math.max(0, Number(e.target.value)),
                          )
                        }
                      />
                    </td>

                    <td className={`text-center fw-semibold ${diffColor}`}>
                      {diffLabel}
                    </td>

                    <td>
                      <input
                        type="number"
                        min={0}
                        className="form-control form-control-sm text-end"
                        value={line.item_price}
                        onChange={(e) =>
                          handleLineChange(
                            index,
                            "item_price",
                            Math.max(0, Number(e.target.value)),
                          )
                        }
                      />
                    </td>

                    <td className="text-end fw-bold">
                      {line.item_amount.toLocaleString()}
                    </td>

                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={line.remark}
                        placeholder="optional"
                        onChange={(e) =>
                          handleLineChange(index, "remark", e.target.value)
                        }
                      />
                    </td>

                    <td className="text-center">
                      <button
                        className="btn btn-sm text-danger p-1"
                        title="Remove line"
                        onClick={() => handleDeleteLine(line._tempId)}
                      >
                        <i className="bi bi-trash" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            <tfoot className="table-light">
              <tr>
                <td colSpan={4}>
                  <span className="badge bg-success-subtle text-success">
                    Total: {lines.length}{" "}
                    {lines.length === 1 ? "item" : "items"}
                  </span>
                </td>
                <td colSpan={2} className="text-end fw-bold">
                  Total Item Amount:
                </td>
                <td className="text-end fw-bold text-primary fs-5">
                  {totalAmount.toLocaleString()}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="card-footer bg-white border-0 d-flex justify-content-between align-items-center py-2">
          <small className="text-muted">
            Rows highlighted in yellow have incomplete required fields and will
            not be submitted.
          </small>
          <button
            className="btn btn-primary px-4"
            onClick={handleSubmit}
            disabled={submitting || !isFormValid}
            title={
              !isFormValid
                ? "Fill in all required fields and at least one valid line"
                : ""
            }
          >
            {submitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                />
                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-plus-circle me-2" />
                Create Receipt
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemReceipt;
