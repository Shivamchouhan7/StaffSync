import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';
import { notificationService } from '../services/api';
import {
  Menu,
  Bell,
  LogOut,
  User,
  CheckCheck,
  Calendar,
  Megaphone,
  GraduationCap,
  Info,
} from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  // Close notifications dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showNotifications]);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getAll();
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (e) {
      // Silently ignore or retain current
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll notifications every 60s
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkOneRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'leave':
        return <Calendar size={14} className="text-warning" />;
      case 'announcement':
        return <Megaphone size={14} className="text-primary" />;
      case 'training':
        return <GraduationCap size={14} className="text-success" />;
      default:
        return <Info size={14} className="text-info" />;
    }
  };

  return (
    <header className="top-navbar">
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-sm btn-outline-secondary d-lg-none"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
        >
          <Menu size={20} />
        </button>
        <div className="d-none d-sm-block">
          <span className="text-muted small">StaffSync HR Portal</span>
          <h6 className="mb-0 fw-bold text-dark text-capitalize">{user?.role} Workspace</h6>
        </div>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Notification Bell Dropdown */}
        <div className="position-relative" ref={notifRef}>
          <button
            className="btn btn-light rounded-circle position-relative p-2"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <Bell size={20} className="text-secondary" />
            {unreadCount > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: '0.65rem' }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="dropdown-menu dropdown-menu-end show shadow-lg border-0 p-0 position-absolute end-0 mt-2"
              style={{ width: '340px', maxHeight: '420px', zIndex: 1100, borderRadius: '12px' }}
            >
              <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light rounded-top">
                <span className="fw-bold small mb-0">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    className="btn btn-link btn-sm p-0 text-primary small d-flex align-items-center gap-1 text-decoration-none"
                    onClick={handleMarkAllRead}
                  >
                    <CheckCheck size={14} /> Mark all read
                  </button>
                )}
              </div>

              <div className="overflow-auto" style={{ maxHeight: '320px' }}>
                {notifications.length === 0 ? (
                  <div className="text-center p-4 text-muted small">No notifications yet</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`p-3 border-bottom cursor-pointer transition ${
                        !n.isRead ? 'bg-light' : ''
                      }`}
                      onClick={() => !n.isRead && handleMarkOneRead(n._id)}
                    >
                      <div className="d-flex align-items-start gap-2">
                        <div className="p-1 rounded-circle bg-white shadow-sm mt-1">
                          {getNotificationIcon(n.type)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className={`mb-1 small ${!n.isRead ? 'fw-bold text-dark' : 'text-secondary'}`}>
                            {n.title}
                          </p>
                          <p className="mb-1 text-muted" style={{ fontSize: '0.75rem', lineHeight: '1.3' }}>
                            {n.message}
                          </p>
                          <span className="text-muted" style={{ fontSize: '0.68rem' }}>
                            {new Date(n.createdAt).toLocaleDateString()} at{' '}
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Logout */}
        <div className="dropdown">
          <button
            className="btn btn-light d-flex align-items-center gap-2 py-1 px-2 rounded-pill border"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
              style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-start d-none d-md-block pe-1">
              <span className="d-block small fw-bold text-dark lh-1">{user?.name}</span>
              <span className="text-muted text-uppercase" style={{ fontSize: '0.65rem' }}>
                {user?.role}
              </span>
            </div>
          </button>

          <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2">
            <li className="px-3 py-2 border-bottom">
              <span className="d-block small fw-bold text-dark">{user?.name}</span>
              <span className="d-block text-muted small">{user?.email}</span>
            </li>
            <li>
              <Link className="dropdown-item d-flex align-items-center gap-2 small py-2" to="/profile">
                <User size={16} /> My Profile
              </Link>
            </li>
            <li>
              <hr className="dropdown-divider my-1" />
            </li>
            <li>
              <button
                className="dropdown-item d-flex align-items-center gap-2 text-danger small py-2"
                onClick={handleLogout}
              >
                <LogOut size={16} /> Sign out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
