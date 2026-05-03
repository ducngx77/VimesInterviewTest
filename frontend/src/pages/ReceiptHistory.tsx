import React, { useEffect, useState } from "react";
import { receiptApi } from "../services/receiptApi";
import { ReceiptHistoryDTO, ReceiptFilterParams } from "@shared/type";

const STATUS_META: Record<string, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-secondary" },
  completed: { label: "Completed", cls: "bg-success" },
  cancelled: { label: "Cancelled", cls: "bg-danger" },
};

const ReceiptHistory: React.FC = () => {
  const [history, setHistory] = useState<ReceiptHistoryDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<any[]>([]);
  const [selectedHeader, setSelectedHeader] =
    useState<ReceiptHistoryDTO | null>(null);

  // Read department_id from session
  const session = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("user_session") ?? "{}");
    } catch {
      return {};
    }
  })();
  const departmentId: number | undefined = session.department_id;
  const companyId: number | undefined = session.company_id;

  const [filters, setFilters] = useState<ReceiptFilterParams>({
    fromDate: "",
    toDate: "",
    supplierId: "",
    status: "",
    warehouseId: "",
    departmentId,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      // Strip empty strings before sending
      const clean: ReceiptFilterParams = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== "" && v !== undefined),
      ) as ReceiptFilterParams;
      const data = await receiptApi.getHistory(clean);
      setHistory(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleViewDetail = async (row: ReceiptHistoryDTO) => {
    try {
      console.log(
        "Loading details for receipt_header_id:",
        row.receipt_header_id,
      );
      const data = await receiptApi.getDetail(row.receipt_header_id);
      console.log("Detail data:", data);
      setSelectedDetail(data);
      setSelectedHeader(row);
      setShowModal(true);
    } catch {
      alert("Error loading receipt details. Please try again later.");
    }
  };

  const handleFilterChange = (
    field: keyof ReceiptFilterParams,
    value: string,
  ) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const totalAmount = history.reduce((s, r) => s + (r.total_amount ?? 0), 0);

  return (
    <div className="container-fluid animate__animated animate__fadeIn">
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white py-3">
          <h4 className="mb-0 fw-bold text-primary">Receipt History</h4>
        </div>
        <div className="card-body bg-light-subtle">
          <div className="row g-2 align-items-end">
            <div className="col-md-2">
              <label className="form-label small fw-bold">From Date</label>
              <input
                type="date"
                className="form-control"
                value={filters.fromDate ?? ""}
                onChange={(e) => handleFilterChange("fromDate", e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label small fw-bold">To Date</label>
              <input
                type="date"
                className="form-control"
                value={filters.toDate ?? ""}
                onChange={(e) => handleFilterChange("toDate", e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label small fw-bold">Status</label>
              <select
                className={`form-select ${!filters.status ? "text-muted" : ""}`}
                value={filters.status ?? ""}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="" className="text-muted">
                  All Status
                </option>
                <option value="draft" className="text-body">
                  Draft
                </option>
                <option value="completed" className="text-body">
                  Completed
                </option>
                <option value="cancelled" className="text-body">
                  Cancelled
                </option>
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label small fw-bold">Department</label>
              <input
                type="text"
                className="form-control"
                value={session.department_name ?? `Dept #${departmentId}`}
                readOnly
                style={{ background: "#f8f9fa", cursor: "default" }}
              />
            </div>

            <div className="col-md-2">
              <button
                className="btn btn-primary w-100"
                onClick={loadData}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    <i className="bi bi-search me-2" />
                    Search
                  </>
                )}
              </button>
            </div>

            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setFilters({
                    fromDate: "",
                    toDate: "",
                    supplierId: "",
                    status: "",
                    warehouseId: "",
                    departmentId,
                  });
                  setTimeout(loadData, 0);
                }}
              >
                <i className="bi bi-arrow-counterclockwise me-2" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <h6 className="mb-0 fw-bold text-success">Results</h6>
            <span className="badge bg-success-subtle text-success">
              {history.length} {history.length === 1 ? "record" : "records"}
            </span>
          </div>
          <small className="text-muted">
            Total:{" "}
            <strong className="text-primary">
              {totalAmount.toLocaleString()}
            </strong>
          </small>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Receipt No</th>
                <th>Date</th>
                <th>Supplier</th>
                <th>Warehouse</th>
                <th>Location</th>
                <th>Department</th>
                <th className="text-end">Total Amount</th>
                <th className="text-center">Status</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} className="text-center py-4 text-muted">
                    <span className="spinner-border spinner-border-sm me-2" />
                    Loading...
                  </td>
                </tr>
              )}
              {!loading && history.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-4 text-muted">
                    No records found.
                  </td>
                </tr>
              )}
              {!loading &&
                history.map((row) => {
                  const status = STATUS_META[row.status] ?? {
                    label: row.status,
                    cls: "bg-secondary",
                  };
                  return (
                    <tr
                      key={row.receipt_header_id}
                      onClick={() => handleViewDetail(row)}
                      style={{ cursor: "pointer" }}
                    >
                      <td className="fw-semibold text-primary">
                        {row.receipt_no}
                      </td>
                      <td>
                        {new Date(row.receipt_date).toLocaleDateString("vi-VN")}
                      </td>
                      <td>{row.supplier_name ?? "—"}</td>
                      <td>{row.warehouse_name}</td>
                      <td>{row.location_name}</td>
                      <td>{row.department_short_name}</td>
                      <td className="text-end fw-semibold">
                        {(row.total_amount ?? 0).toLocaleString()}
                      </td>
                      <td className="text-center">
                        <span className={`badge ${status.cls}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="text-muted small">{row.remark ?? "—"}</td>
                    </tr>
                  );
                })}
            </tbody>
            <tfoot className="table-light">
              <tr>
                <td colSpan={6} className="text-end fw-bold">
                  Total:
                </td>
                <td className="text-end fw-bold text-primary">
                  {totalAmount.toLocaleString()}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {showModal && selectedHeader && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold">
                    {selectedHeader.receipt_no}
                  </h5>
                  <small className="text-muted">
                    {new Date(selectedHeader.receipt_date).toLocaleDateString(
                      "vi-VN",
                    )}
                    &nbsp;·&nbsp;{selectedHeader.supplier_name}
                    &nbsp;·&nbsp;{selectedHeader.warehouse_name} /{" "}
                    {selectedHeader.location_name}
                  </small>
                </div>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <div className="modal-body p-0">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Item Code</th>
                      <th>Item Name</th>
                      <th>UoM</th>
                      <th className="text-end">Receipt Qty</th>
                      <th className="text-end">Real Qty</th>
                      <th className="text-center">Diff</th>
                      <th className="text-end">Unit Price</th>
                      <th className="text-end">Amount</th>
                      <th>Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDetail.length === 0 && (
                      <tr>
                        <td
                          colSpan={10}
                          className="text-center py-3 text-muted"
                        >
                          No lines found.
                        </td>
                      </tr>
                    )}
                    {selectedDetail.map((line, i) => {
                      const diff = line.real_quantity - line.receipt_qty;
                      const diffColor =
                        diff === 0
                          ? "text-muted"
                          : diff > 0
                            ? "text-danger"
                            : "text-warning";
                      return (
                        <tr key={line.receipt_line_id}>
                          <td className="text-muted">{i + 1}</td>
                          <td className="fw-semibold">{line.item_code}</td>
                          <td>{line.item_name}</td>
                          <td className="text-center">{line.uom_code}</td>
                          <td className="text-end">
                            {line.receipt_qty?.toLocaleString()}
                          </td>
                          <td className="text-end">
                            {line.real_quantity?.toLocaleString()}
                          </td>
                          <td
                            className={`text-center fw-semibold ${diffColor}`}
                          >
                            {diff === 0
                              ? "—"
                              : (diff > 0 ? "+" : "") + diff.toLocaleString()}
                          </td>
                          <td className="text-end">
                            {line.item_price?.toLocaleString()}
                          </td>
                          <td className="text-end fw-semibold">
                            {line.item_amount?.toLocaleString()}
                          </td>
                          <td className="text-muted small">
                            {line.remark ?? "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <td colSpan={8} className="text-end fw-bold">
                        Total:
                      </td>
                      <td className="text-end fw-bold text-primary">
                        {selectedDetail
                          .reduce((s, l) => s + (l.item_amount ?? 0), 0)
                          .toLocaleString()}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="modal-footer">
                <span
                  className={`badge ${STATUS_META[selectedHeader.status]?.cls ?? "bg-secondary"} me-auto`}
                >
                  {STATUS_META[selectedHeader.status]?.label ??
                    selectedHeader.status}
                </span>
                <strong className="text-primary me-3">
                  Total: {(selectedHeader.total_amount ?? 0).toLocaleString()}
                </strong>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptHistory;
