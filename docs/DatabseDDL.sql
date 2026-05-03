-- =====================
-- COMPANY
-- =====================
CREATE TABLE company (
  company_id SERIAL PRIMARY KEY,
  company_name VARCHAR(255),
  company_short_name VARCHAR(100),
  company_code VARCHAR(50) UNIQUE,
  description TEXT,
  tax_code VARCHAR(50),
  address TEXT,
  enable_flag BOOLEAN DEFAULT TRUE,
  supplier_flag BOOLEAN DEFAULT FALSE,
  customer_flag BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER
);

-- =====================
-- DEPARTMENT
-- =====================
CREATE TABLE department (
  department_id SERIAL PRIMARY KEY,
  department_name VARCHAR(255),
  department_short_name VARCHAR(100),
  department_code VARCHAR(50) UNIQUE,
  description TEXT,
  company_id INTEGER NOT NULL,
  enable_flag BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER
);

-- =====================
-- WAREHOUSE
-- =====================
CREATE TABLE warehouse (
  warehouse_id SERIAL PRIMARY KEY,
  warehouse_name VARCHAR(255),
  warehouse_code VARCHAR(50) UNIQUE,
  company_id INTEGER,
  description TEXT,
  enable_flag BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER
);

-- =====================
-- LOCATION
-- =====================
CREATE TABLE wh_location (
  wh_location_id SERIAL PRIMARY KEY,
  location_name VARCHAR(255),
  location_code VARCHAR(50) UNIQUE,
  warehouse_id INTEGER,
  description TEXT,
  enable_flag BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER
);

-- =====================
-- USER
-- =====================
CREATE TABLE user (
  user_id SERIAL PRIMARY KEY,
  user_name VARCHAR(100),
  password VARCHAR(255),
  user_type VARCHAR(50),
  effective_date_from TIMESTAMP,
  effective_date_to TIMESTAMP,
  enable_flag BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER
);

-- =====================
-- PERSON
-- =====================
CREATE TABLE person (
  person_id SERIAL PRIMARY KEY,
  person_code VARCHAR(50) UNIQUE,
  user_id INTEGER,
  person_name VARCHAR(255),
  dob DATE,
  gender VARCHAR(10),
  department_id INTEGER,
  nation_id VARCHAR(50),
  phone VARCHAR(20),
  email VARCHAR(100),
  married_flag BOOLEAN,
  live_address TEXT,
  enable_flag BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER
);

-- =====================
-- UOM
-- =====================
CREATE TABLE uom (
  uom_id SERIAL PRIMARY KEY,
  uom_name VARCHAR(100),
  uom_code VARCHAR(50) UNIQUE,
  description TEXT,
  conversion_rate NUMERIC,
  enable_flag BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER
);

-- =====================
-- ITEM
-- =====================
CREATE TABLE item (
  item_id SERIAL PRIMARY KEY,
  item_name VARCHAR(255),
  item_code VARCHAR(50) UNIQUE,
  description TEXT,
  uom_id INTEGER,
  supplier_id INTEGER,
  enable_flag BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER
);

-- =====================
-- INVENTORY
-- =====================
CREATE TABLE inventory (
  inv_id SERIAL PRIMARY KEY,
  item_id INTEGER,
  warehouse_id INTEGER,
  location_id INTEGER,
  quantity NUMERIC(15,2) DEFAULT 0,
  reserved_quantity NUMERIC(15,2) DEFAULT 0,
  enable_flag BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER
);

-- =====================
-- ACCOUNT
-- =====================
CREATE TABLE account (
  account_id SERIAL PRIMARY KEY,
  account_no VARCHAR(50) UNIQUE,
  account_name VARCHAR(255),
  description TEXT,
  enable_flag BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER
);

-- =====================
-- RECEIPT HEADER
-- =====================
CREATE TABLE receipt_header (
  receipt_header_id SERIAL PRIMARY KEY,
  company_id INTEGER,
  department_id INTEGER,
  warehouse_id INTEGER,
  location_id INTEGER,
  receipt_date DATE,
  receipt_no VARCHAR(50) UNIQUE,
  supplier_id INTEGER,
  debit_account_id INTEGER,
  credit_account_id INTEGER,
  total_amount NUMERIC(15,2),
  ref_doc_no VARCHAR(200),
  ref_date DATE,
  status VARCHAR(20),
  remark TEXT,
  enable_flag BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER
);

-- =====================
-- RECEIPT LINE
-- =====================
CREATE TABLE receipt_line (
  receipt_line_id SERIAL PRIMARY KEY,
  receipt_header_id INTEGER,
  warehouse_id INTEGER,
  location_id INTEGER,
  item_id INTEGER,
  uom_id INTEGER,
  receipt_qty NUMERIC(15,2),
  real_quantity NUMERIC(15,2),
  item_price NUMERIC(15,2),
  item_amount NUMERIC(15,2),
  remark TEXT,
  enable_flag BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER
);

ALTER TABLE department ADD FOREIGN KEY (company_id) REFERENCES company(company_id);
ALTER TABLE warehouse ADD FOREIGN KEY (company_id) REFERENCES company(company_id);
ALTER TABLE wh_location ADD FOREIGN KEY (warehouse_id) REFERENCES warehouse(warehouse_id);

ALTER TABLE person ADD FOREIGN KEY (user_id) REFERENCES user(user_id);
ALTER TABLE person ADD FOREIGN KEY (department_id) REFERENCES department(department_id);

ALTER TABLE inventory ADD FOREIGN KEY (item_id) REFERENCES item(item_id);
ALTER TABLE inventory ADD FOREIGN KEY (warehouse_id) REFERENCES warehouse(warehouse_id);
ALTER TABLE inventory ADD FOREIGN KEY (location_id) REFERENCES wh_location(wh_location_id);

ALTER TABLE item ADD FOREIGN KEY (uom_id) REFERENCES uom(uom_id);

ALTER TABLE receipt_header ADD FOREIGN KEY (company_id) REFERENCES company(company_id);
ALTER TABLE receipt_header ADD FOREIGN KEY (department_id) REFERENCES department(department_id);
ALTER TABLE receipt_header ADD FOREIGN KEY (warehouse_id) REFERENCES warehouse(warehouse_id);
ALTER TABLE receipt_header ADD FOREIGN KEY (debit_account_id) REFERENCES account(account_id);
ALTER TABLE receipt_header ADD FOREIGN KEY (credit_account_id) REFERENCES account(account_id);

ALTER TABLE receipt_line ADD FOREIGN KEY (receipt_header_id) REFERENCES receipt_header(receipt_header_id);
ALTER TABLE receipt_line ADD FOREIGN KEY (item_id) REFERENCES item(item_id);
ALTER TABLE receipt_line ADD FOREIGN KEY (uom_id) REFERENCES uom(uom_id);

--DROP SCHEMA public CASCADE;
--CREATE SCHEMA public;