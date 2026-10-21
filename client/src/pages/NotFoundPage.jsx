import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light text-center p-4">
      <div style={{ maxWidth: '480px' }}>
        <div
          className="rounded-circle bg-warning-subtle text-warning d-inline-flex align-items-center justify-content-center mb-3"
          style={{ width: '80px', height: '80px' }}
        >
          <AlertTriangle size={42} />
        </div>
        <h1 className="display-4 fw-bold text-dark mb-2">404</h1>
        <h4 className="fw-bold text-dark mb-2">Page Not Found</h4>
        <p className="text-muted small mb-4">
          The workplace resource or endpoint you requested does not exist or has been relocated.
        </p>
        <Link to="/dashboard" className="btn btn-primary d-inline-flex align-items-center gap-2">
          <Home size={18} /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
