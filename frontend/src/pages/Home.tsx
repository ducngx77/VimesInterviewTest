import { UserDTO } from "@shared/type";

interface HomeProps {
  user: UserDTO;
}

const Home = ({ user }: HomeProps) => {
  return (
    <div className="card border-0 shadow-sm p-4 animate__animated animate__fadeIn">
      <div className="d-flex align-items-center mb-4">
        <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
          <i className="bi bi-person-workspace fs-2 text-primary"></i>
        </div>
        <div>
          <h2 className="text-primary mb-0 fw-bold">Dashboard</h2>
          <p className="text-muted mb-0">
            Welcome back, <strong>{user.person_name}</strong>!
          </p>
        </div>
      </div>

      <hr className="mb-4" />

      <div className="row g-3">
        <div className="col-md-6 col-lg-3">
          <div className="p-3 bg-white border rounded shadow-sm border-start border-4 border-primary h-100">
            <h6 className="text-muted small fw-bold text-uppercase">Company</h6>
            <div className="d-flex align-items-center mt-2">
              <i className="bi bi-building fs-4 me-2 text-primary"></i>
              <div>
                <div className="fw-bold">{user.company_name}</div>
                <small className="text-muted">Code: {user.company_code}</small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="p-3 bg-white border rounded shadow-sm border-start border-4 border-info h-100">
            <h6 className="text-muted small fw-bold text-uppercase">
              Department
            </h6>
            <div className="d-flex align-items-center mt-2">
              <i className="bi bi-diagram-3 fs-4 me-2 text-info"></i>
              <div>
                <div className="fw-bold">{user.department_name}</div>
                <small className="text-muted">
                  Code: {user.department_code}
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="p-3 bg-white border rounded shadow-sm border-start border-4 border-success h-100">
            <h6 className="text-muted small fw-bold text-uppercase">
              Account Type
            </h6>
            <div className="mt-2">
              <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill">
                <i className="bi bi-shield-check me-1"></i>
                {user.user_type === "ADMIN" ? "Administrator" : "Staff"}
              </span>
              <div className="small text-muted mt-1">
                ID: {user.person_code}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="p-3 bg-white border rounded shadow-sm border-start border-4 border-warning h-100">
            <h6 className="text-muted small fw-bold text-uppercase">
              Effective Date
            </h6>
            <div className="d-flex align-items-center mt-2">
              <i className="bi bi-calendar-event fs-4 me-2 text-warning"></i>
              <div className="fw-bold">
                {user.effective_date_from
                  ? new Date(user.effective_date_from).toLocaleDateString(
                      "en-US",
                    )
                  : "—"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
