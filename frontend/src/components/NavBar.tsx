import { UserDTO } from '@shared/type';

interface NavbarProps {
  user: UserDTO;
  onLogout: () => void;
}

const Navbar = ({ user, onLogout }: NavbarProps) => {
  return (
    <nav className="navbar navbar-expand-lg  shadow-sm px-3" style={{ height: '50px' }}>
      <div className="container-fluid">
        <a className="navbar-brand fw-bold d-flex align-items-center" href="/">
          <i className="bi bi-cpu-fill me-2 text-primary"></i>
          <span>VIMES TEST</span>
        </a>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <div className="d-flex align-items-center">       
            <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                 style={{ width: '35px', height: '35px', fontSize: '14px', fontWeight: 'bold' }}>
              {user.user_name.charAt(0).toUpperCase()}
            </div>
            <div className="text-primary me-3 d-none d-sm-block">
              <span className="fw-medium">{user.person_name}</span>
            </div>

            <button 
              className="btn btn-outline-primary btn-sm px-3 fw-bold border-2" 
              onClick={onLogout}
              style={{ borderRadius: '6px' }}
            >
              <i className="bi bi-box-arrow-right me-1"></i>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;