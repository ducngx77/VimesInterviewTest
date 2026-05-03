export interface UserDTO {
  user_id: number;           
  user_name: string;         
  password?: string;
  user_type?: string;
  effective_date_from?: string | Date;
  effective_date_to?: string | Date | null;
  person_code?: string;
  person_name?: string;
  department_id: number;
  department_code?: string;
  department_name?: string;
  company_id?: number;
  company_code?: string;
  company_name?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserDTO;
  message?: string;
}

export interface ReceiptHistoryDTO {
  receipt_header_id: number;
  receipt_no: string;
  receipt_date: string; 
  total_amount: number;
  status: string;
  remark: string | null;

  company_id: number;
  company_code: string;
  company_short_name: string;

  department_id: number;
  department_code: string;
  department_short_name: string;

  warehouse_id: number;
  warehouse_code: string;
  warehouse_name: string;

  wh_location_id: number;
  location_code: string;
  location_name: string;

  supplier_name?: string; 
  supplier_id?: number;

  debit_account_id?: number;
  credit_account_id?: number;
}

export interface ReceiptFilterParams {
  fromDate?:    string;
  toDate?:      string;
  supplierId?:  number | string;
  status?:      string;
  warehouseId?: number | string;
  departmentId?: number;
}

export interface ReceiptHeaderDTO {
  receipt_line_id: number,
  receipt_header_id: number,
  company_id: number;
  department_id: number;
  warehouse_id: string;
  location_id: string;
  receipt_date: string;
  receipt_no?: string;
  supplier_id: string;
  debit_account_id?: string;
  credit_account_id?: string;
  total_amount: number;
  remark: string;
  status?: string;
}

export interface ReceiptLineDTO {
  _tempId: number;
  receipt_line_id: number | null;
  receipt_header_id: number | null;
  warehouse_id: string;
  location_id: string;
  item_id: string;
  uom_id: string;
  uom_code: string;
  uom_name: string;
  receipt_qty: number;
  real_quantity: number;
  item_price: number;
  item_amount: number;
  remark: string;
  enable_flag: boolean;
}

export interface SupplierDTO {
  company_id: number;
  company_name?: string;
  company_code: string;
  description?: string;
}

export interface InventoryDTO {
  inv_id: number;
  item_id: number;
  item_code: string;
  item_name: string;
  uom_code: string;
  warehouse_id: number;
  warehouse_name: string;
  location_id: number;
  location_name: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number; 
}

export interface InventoryFilterParams {
  warehouseId?: string | number;
  locationId?: string | number;
  itemSearch?: string; 
}
  
export interface WarehouseDTO {
  warehouse_id: number;
  warehouse_name: string;
  warehouse_code: string;
}

export interface WarehouseLocationDTO {
  wh_location_id: number;
  location_name: string;
  location_code: string;
}


export interface ItemDTO {
  item_id: number;
  item_name: string;
  item_code: string;
  uom_id: number;
  uom_code?: string;
  description?: string;
}

export interface AccountDTO {
  account_id: number;
  account_no: string;
  account_name: string;
}