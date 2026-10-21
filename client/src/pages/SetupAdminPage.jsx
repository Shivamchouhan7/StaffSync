import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { ShieldAlert, User, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

const SetupAdminPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await authService.setupAdmin(formData);
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to setup HR Administrator.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5 px-3">
      <div className="w-100" style={{ maxWidth: '440px' }}>
        <div className="text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center text-white rounded-4 shadow-sm mb-3"
            style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }}
          >
            <ShieldAlert size={30} />
          </div>
          <h3 className="fw-bold text-dark tracking-tight mb-1">Initial Admin Setup</h3>
          <p className="text-muted small">Initialize the root HR Administrator account</p>
        </div>

        <div className="card border-0 shadow-sm rounded-4 p-4 p-sm-5 bg-white">
          <div className="alert alert-warning py-2 px-3 small rounded-3 mb-3">
            <strong>Security Notice:</strong> This operation is strictly permitted only once when no HR accounts exist in the database.
          </div>

          {error && (
            <div className="alert alert-danger py-2 px-3 small rounded-3 d-flex align-items-center gap-2 mb-3">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {success ? (
            <div className="alert alert-success py-3 px-3 small rounded-3 text-center">
              <CheckCircle2 size={32} className="text-success mb-2" />
              <h6 className="fw-bold mb-1">HR Administrator Created!</h6>
              <p className="mb-0">Redirecting to sign-in...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Admin Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    name="name"
                    className="form-control border-start-0 ps-0"
                    placeholder="HR Administrator"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Admin Work Email</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    name="email"
                    className="form-control border-start-0 ps-0"
                    placeholder="hr.admin@staffsync.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-secondary">Master Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    name="password"
                    className="form-control border-start-0 ps-0"
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status" />
                ) : (
                  <>
                    <span>Initialize HR Account</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="text-center mt-4 pt-2 border-top">
            <p className="text-muted small mb-0">
              Already initialized?{' '}
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

export default SetupAdminPage;
