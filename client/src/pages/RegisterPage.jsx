import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, clearError } from '../features/auth/authSlice';
import { Building2, User, Mail, Lock, Briefcase, Phone, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Engineering',
    designation: 'Software Engineer',
    phone: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser(formData));
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5 px-3">
      <div className="w-100" style={{ maxWidth: '520px' }}>
        <div className="text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center text-white rounded-4 shadow-sm mb-3"
            style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
          >
            <Building2 size={30} />
          </div>
          <h3 className="fw-bold text-dark tracking-tight mb-1">Create Employee Account</h3>
          <p className="text-muted small">Register to access your personal workplace portal</p>
        </div>

        <div className="card border-0 shadow-sm rounded-4 p-4 p-sm-5 bg-white">
          <div className="alert alert-info py-2 px-3 small rounded-3 d-flex align-items-center gap-2 mb-3">
            <CheckCircle2 size={16} /> Public registration registers you with the <strong>Employee</strong> role.
          </div>

          {error && (
            <div className="alert alert-danger py-2 px-3 small rounded-3 d-flex align-items-center gap-2 mb-3">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Full Name</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  name="name"
                  className="form-control border-start-0 ps-0"
                  placeholder="e.g. Maya Lin"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  name="email"
                  className="form-control border-start-0 ps-0"
                  placeholder="maya@staffsync.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  name="password"
                  className="form-control border-start-0 ps-0"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-sm-6">
                <label className="form-label small fw-semibold text-secondary">Department</label>
                <select
                  name="department"
                  className="form-select"
                  value={formData.department}
                  onChange={handleChange}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Product & Design">Product & Design</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              <div className="col-sm-6">
                <label className="form-label small fw-semibold text-secondary">Designation</label>
                <input
                  type="text"
                  name="designation"
                  className="form-control"
                  placeholder="Software Engineer"
                  value={formData.designation}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold text-secondary">Phone (Optional)</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Phone size={16} />
                </span>
                <input
                  type="tel"
                  name="phone"
                  className="form-control border-start-0 ps-0"
                  placeholder="+1-555-0199"
                  value={formData.phone}
                  onChange={handleChange}
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
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-4 pt-2 border-top">
            <p className="text-muted small mb-0">
              Already have an account?{' '}
              <Link to="/login" className="text-primary fw-semibold text-decoration-none">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
