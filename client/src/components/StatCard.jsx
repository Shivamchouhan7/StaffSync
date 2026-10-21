import React from 'react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'primary', // 'primary', 'success', 'warning', 'info', 'danger'
}) => {
  const variantStyles = {
    primary: { bg: '#eff6ff', color: '#2563eb' },
    success: { bg: '#ecfdf5', color: '#059669' },
    warning: { bg: '#fffbeb', color: '#d97706' },
    info: { bg: '#f0fdfa', color: '#0d9488' },
    danger: { bg: '#fef2f2', color: '#dc2626' },
    purple: { bg: '#faf5ff', color: '#9333ea' },
  };

  const style = variantStyles[variant] || variantStyles.primary;

  return (
    <div className="stat-card h-100">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <span className="text-muted small fw-semibold text-uppercase tracking-wider">{title}</span>
        {Icon && (
          <div
            className="stat-icon-wrapper"
            style={{ backgroundColor: style.bg, color: style.color }}
          >
            <Icon size={22} />
          </div>
        )}
      </div>
      <div className="d-flex align-items-baseline gap-2">
        <h2 className="fw-bold mb-0 text-dark">{value}</h2>
      </div>
      {subtitle && <p className="text-muted small mt-2 mb-0">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
