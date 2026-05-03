--ACCOUNT
INSERT INTO public.account (
  account_id, account_no, account_name, description, enable_flag, created_at, created_by
)
VALUES 
(1, '156', 'Hàng hóa', 'Tài khoản hàng tồn kho', TRUE, CURRENT_TIMESTAMP, 1 ),
(2, '331', 'Phải trả nhà cung cấp', 'Công nợ phải trả NCC', TRUE, CURRENT_TIMESTAMP, 1 );

--COMPANY
INSERT INTO public.company(
  company_id, company_name, company_short_name, company_code, description, tax_code, address, enable_flag, supplier_flag, customer_flag, created_at, created_by
)
VALUES 
	(1, 'Công ty CP Phần mềm Y tế Việt Nam', 'Cty CP VIMES', 'VIMES', NULL, '0123456789', 'Nguyệt Quế 12-11, Vinhomes Riverside The Harmony, P.Phúc Lợi, TP.Hà Nội', 
	TRUE, FALSE, FALSE, CURRENT_TIMESTAMP, 1), 
  	(2, 'Công ty CP Khách Hàng 1', 'Cty Khách 1', 'CUSTOMER_1', NULL, '01234565432', 'Số 12, Quang Trung, P.Bình Xuyên, Bắc Ninh',
	TRUE, TRUE, FALSE, CURRENT_TIMESTAMP, 1),
	(3, 'Công ty CP Khách Hàng 2', 'Cty Khách 2', 'CUSTOMER_2', NULL, '01234565444', 'Số 38, Minh Khai, P.Bình Xuyên, Bắc Ninh',
	TRUE, TRUE, FALSE, CURRENT_TIMESTAMP, 1);

--DEPARTMENT
INSERT INTO public.department (
  department_id, department_name, department_short_name, department_code, company_id, enable_flag, created_at, created_by
)
VALUES
	(1,'Mua hàng','PUR','PUR',1,TRUE,CURRENT_TIMESTAMP,1),
	(2,'Kế toán','ACC','ACC',1,TRUE,CURRENT_TIMESTAMP,1),
	(3,'Sản xuất','PROD','PROD',1,TRUE,CURRENT_TIMESTAMP,1);
	
--WAREHOUSE
INSERT INTO public.warehouse (
  warehouse_id, warehouse_name, warehouse_code, company_id, enable_flag, created_at, created_by
)
VALUES
	(1,'Kho NVL','WH_RAW',1,TRUE,CURRENT_TIMESTAMP,1),
	(2,'Kho TP','WH_FIN',1,TRUE,CURRENT_TIMESTAMP,1);
	
--WH_LOCATION
INSERT INTO public.wh_location (
  wh_location_id, location_name, location_code, warehouse_id, enable_flag, created_at, created_by
)
VALUES
	(1, 'A1', 'A1',1,TRUE,CURRENT_TIMESTAMP,1),
	(2, 'A2', 'A2',1,TRUE,CURRENT_TIMESTAMP,1),
	(3, 'B1', 'B1',2,TRUE,CURRENT_TIMESTAMP,1),
	(4, 'B2', 'B2',2,TRUE,CURRENT_TIMESTAMP,1);

--ITEM
INSERT INTO public.item (
  item_id, item_name, item_code, uom_id, supplier_id, enable_flag, created_at, created_by
)
VALUES
	(1,'Khẩu trang y tế','MASK',3,1,TRUE,CURRENT_TIMESTAMP,1),
	(2,'Găng tay y tế','GLOVE',1,1,TRUE,CURRENT_TIMESTAMP,1),
	(3,'Dung dịch sát khuẩn','SANITIZER',4,1,TRUE,CURRENT_TIMESTAMP,1);

--UOM
INSERT INTO public.uom (
  uom_id, uom_name, uom_code,
  enable_flag, created_at, created_by
)
VALUES
	(1,'Cái','PCS',TRUE,CURRENT_TIMESTAMP,1),
	(2,'Vỉ','PACK',TRUE,CURRENT_TIMESTAMP,1),
	(3,'Hộp','BOX',TRUE,CURRENT_TIMESTAMP,1),
	(4,'Chai','BOTTLE',TRUE,CURRENT_TIMESTAMP,1);
	
--USER
INSERT INTO public.user (
  user_id, user_name, password, user_type, enable_flag, created_at, created_by
)
VALUES
	(1,'admin','123456','ADMIN',TRUE,CURRENT_TIMESTAMP,1),
	(2,'emp1','123456','USER',TRUE,CURRENT_TIMESTAMP,1);
	
--PERSON
INSERT INTO public.person (
  person_id, person_code, user_id, person_name,
  gender, department_id, phone, email,
  enable_flag, created_at, created_by
)
VALUES
	(1,'EMP001',1,'Nguyễn Văn A','M',2,'0901234567','admin@vimes.vn',TRUE,CURRENT_TIMESTAMP,1),
	(2,'EMP002',2,'Trần Thị B','F',1,'0912345678','kho@vimes.vn',TRUE,CURRENT_TIMESTAMP,1);
