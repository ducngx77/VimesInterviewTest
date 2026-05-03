import { pool } from '../config/db.js';

export const verifyUser = async (username: string, pass: string) => {
  const result = await pool.query(
    `SELECT 
        U.user_id, 
        U.user_name, 
        U.user_type, 
        P.person_code, 
        P.person_name, 
        P.department_id,
        D.department_name,
        D.department_code,
        C.company_id,
        C.company_name,
        C.company_code,
        U.effective_date_from, 
        U.effective_date_to
    FROM public.user U
    JOIN public.person P ON U.user_id = P.user_id
    JOIN public.department D ON P.department_id = D.department_id
    JOIN public.company C ON D.company_id = C.company_id
    WHERE U.user_name = $1 
      AND U.password = $2 
      AND U.enable_flag = true 
      AND NOW() >= U.effective_date_from 
      AND (U.effective_date_to IS NULL OR NOW() <= U.effective_date_to)`,
    [username, pass]
  );
  
  return result.rows[0];
};