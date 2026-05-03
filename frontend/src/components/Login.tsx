import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginResponse } from '@shared/type';
import { authApi } from '../services/authApi';

interface LoginProps {
  onLoginSuccess: (data: LoginResponse) => void;
}

function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const data = await authApi.login({ username, password });

      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user_session', JSON.stringify(data.user));

      onLoginSuccess(data);
      navigate('/');
      
    } catch (err: any) {
      setMessage(err.message || "Error: Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container">
      <div className="row justify-content-center align-items-center vh-100">
        <div className="col-md-5 col-lg-4">
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <div className="display-4 text-primary mb-2">
                  <i className="bi bi-shield-lock-fill"></i>
                </div>
                <h2 className="fw-bold text-dark">VIMES TEST</h2>
                <p className="text-muted small">Receipt Management System</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-floating mb-3">
                  <input 
                    type="text" 
                    className="form-control" 
                    id="floatingInput" 
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoFocus
                  />
                  <label htmlFor="floatingInput">Username</label>
                </div>

                <div className="form-floating mb-4">
                  <input 
                    type="password" 
                    className="form-control" 
                    id="floatingPassword" 
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <label htmlFor="floatingPassword">Password</label>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100 py-2 fw-bold shadow-sm transition-all"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Loading...
                    </>
                  ) : 'LOGIN'}
                </button>
              </form>

              {message && (
                <div className="alert alert-danger mt-4 py-2 small text-center border-0 shadow-sm animate__animated animate__shakeX">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {message}
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default Login;