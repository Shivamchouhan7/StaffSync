import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { loginUser, clearError } from '../features/auth/authSlice';
import { Building2, Lock, Mail, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, user, isLoading, error } = useSelector((state) => state.auth);

  const queryParams = new URLSearchParams(location.search);
  const sessionExpired = queryParams.get('expired');

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    dispatch(loginUser({ email, password }));
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    dispatch(loginUser({ email: demoEmail, password: demoPassword }));
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5 px-3">
      <div className="w-100" style={{ maxWidth: '440px' }}>
        {/* Brand Header */}
        <div className="text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center text-white rounded-4 shadow-sm mb-3"
            style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
          >
            <Building2 size={30} />
          </div>
          <h3 className="fw-bold text-dark tracking-tight mb-1">StaffSync HRMS</h3>
          <p className="text-muted small">Intelligent Human Resource Management Platform</p>
        </div>

        {/* Card */}
        <div className="card border-0 shadow-sm rounded-4 p-4 p-sm-5 bg-white">
          <h4 className="fw-bold mb-3 text-dark text-center">Sign In</h4>

          {sessionExpired && (
            <div className="alert alert-warning py-2 px-3 small rounded-3 d-flex align-items-center gap-2 mb-3">
              <AlertCircle size={16} /> Your session expired. Please sign in again.
            </div>
          )}

          {error && (
            <div className="alert alert-danger py-2 px-3 small rounded-3 d-flex align-items-center gap-2 mb-3">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Work Email</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  className="form-control border-start-0 ps-0"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold text-secondary">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  className="form-control border-start-0 ps-0"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="spinner-border spinner-border-sm" role="status" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-4 pt-3 border-top">
            <span className="d-block text-muted text-center small mb-2 fw-medium">
              Demo Credentials (Click to Sign In):
            </span>
            <div className="d-flex flex-column gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-between px-3 py-2 rounded-3 text-start"
                onClick={() => handleQuickLogin('hr@staffsync.com', 'Password@123')}
              >
                <div>
                  <span className="d-block fw-bold small">HR Administrator</span>
                  <span className="d-block text-muted" style={{ fontSize: '0.72rem' }}>
                    hr@staffsync.com
                  </span>
                </div>
                <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                  HR Role
                </span>
              </button>

              <button
                type="button"
                className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-between px-3 py-2 rounded-3 text-start"
                onClick={() => handleQuickLogin('manager@staffsync.com', 'Password@123')}
              >
                <div>
                  <span className="d-block fw-bold small">Engineering Manager</span>
                  <span className="d-block text-muted" style={{ fontSize: '0.72rem' }}>
                    manager@staffsync.com
                  </span>
                </div>
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                  Manager Role
                </span>
              </button>

              <button
                type="button"
                className="btn btn-sm btn-outline-success d-flex align-items-center justify-content-between px-3 py-2 rounded-3 text-start"
                onClick={() => handleQuickLogin('employee@staffsync.com', 'Password@123')}
              >
                <div>
                  <span className="d-block fw-bold small">Senior Engineer</span>
                  <span className="d-block text-muted" style={{ fontSize: '0.72rem' }}>
                    employee@staffsync.com
                  </span>
                </div>
                <span className="badge bg-success-subtle text-success border border-success-subtle">
                  Employee Role
                </span>
              </button>
            </div>
          </div>

          <div className="text-center mt-4 pt-2">
            <p className="text-muted small mb-1">
              New employee?{' '}
              <Link to="/register" className="text-primary fw-semibold text-decoration-none">
                Register account
              </Link>
            </p>
            <p className="text-muted small mb-0">
              Fresh database setup?{' '}
              <Link to="/setup-admin" className="text-secondary fw-semibold text-decoration-none">
                Initialize HR Admin
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
