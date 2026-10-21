import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CalendarCheck,
  CalendarOff,
  Megaphone,
  GraduationCap,
  Award,
  UserCircle,
  Building2,
  Shield,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role || 'employee';

  const roleBadgeConfig = {
    hr: { label: 'HR Admin', bg: '#ef4444' },
    manager: { label: 'Manager', bg: '#3b82f6' },
    employee: { label: 'Employee', bg: '#10b981' },
  };

  const badge = roleBadgeConfig[role] || roleBadgeConfig.employee;

  return (
    <aside className={`sidebar ${isOpen ? 'show' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center text-white rounded-3 shadow-sm"
            style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
          >
            <Building2 size={20} />
          </div>
          <span className="fw-bold tracking-tight text-white">StaffSync</span>
        </div>
        <span
          className="badge px-2 py-1 text-white font-monospace"
          style={{ backgroundColor: badge.bg, fontSize: '0.68rem', borderRadius: '4px' }}
        >
          {badge.label}
        </span>
      </div>

      {/* Navigation Links */}
      <div className="sidebar-nav">
        {/* Core Section */}
        <div className="sidebar-section-title">Core</div>
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        {/* HR-Specific Navigation */}
        {role === 'hr' && (
          <>
            <div className="sidebar-section-title mt-2">Workforce Management</div>
            <NavLink
              to="/employees"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Users size={18} />
              <span>Employee Directory</span>
            </NavLink>
            <NavLink
              to="/managers"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <UserCheck size={18} />
              <span>Managers & Teams</span>
            </NavLink>

            <div className="sidebar-section-title mt-2">Operations</div>
            <NavLink
              to="/attendance"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <CalendarCheck size={18} />
              <span>Attendance Records</span>
            </NavLink>
            <NavLink
              to="/leaves"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <CalendarOff size={18} />
              <span>Leave Requests</span>
            </NavLink>
          </>
        )}

        {/* Manager-Specific Navigation */}
        {role === 'manager' && (
          <>
            <div className="sidebar-section-title mt-2">Team Operations</div>
            <NavLink
              to="/employees"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Users size={18} />
              <span>My Team Members</span>
            </NavLink>
            <NavLink
              to="/attendance"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <CalendarCheck size={18} />
              <span>Team Attendance</span>
            </NavLink>
            <NavLink
              to="/leaves"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <CalendarOff size={18} />
              <span>Team Leaves</span>
            </NavLink>
          </>
        )}

        {/* Employee-Specific Navigation */}
        {role === 'employee' && (
          <>
            <div className="sidebar-section-title mt-2">Workplace</div>
            <NavLink
              to="/attendance"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <CalendarCheck size={18} />
              <span>My Attendance</span>
            </NavLink>
            <NavLink
              to="/leaves"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <CalendarOff size={18} />
              <span>Leave Application</span>
            </NavLink>
          </>
        )}

        {/* Shared Growth & Development Navigation */}
        <div className="sidebar-section-title mt-2">Company & Growth</div>
        <NavLink
          to="/announcements"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <Megaphone size={18} />
          <span>Announcements</span>
        </NavLink>
        <NavLink
          to="/trainings"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <GraduationCap size={18} />
          <span>Training Programs</span>
        </NavLink>
        <NavLink
          to="/performance"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <Award size={18} />
          <span>{role === 'employee' ? 'My Performance' : 'Performance Reviews'}</span>
        </NavLink>

        {/* Account */}
        <div className="sidebar-section-title mt-2">Account</div>
        <NavLink
          to="/profile"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <UserCircle size={18} />
          <span>My Profile</span>
        </NavLink>
      </div>

      {/* Footer Profile info */}
      <div className="sidebar-footer">
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold bg-primary"
            style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
            <div className="text-white small fw-bold text-truncate">{user?.name || 'User'}</div>
            <div className="text-muted text-truncate" style={{ fontSize: '0.75rem' }}>
              {user?.email || ''}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
