import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService, attendanceService } from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  CalendarCheck,
  CalendarOff,
  Clock,
  Megaphone,
  GraduationCap,
  Award,
  ArrowRight,
  LogIn,
  LogOut,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

const EmployeeDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchEmployeeData = async () => {
    try {
      const res = await dashboardService.getEmployeeStats();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load employee dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      const res = await attendanceService.checkIn({ notes });
      setFeedback({ type: 'success', message: res.data.message || 'Checked in successfully!' });
      setNotes('');
      fetchEmployeeData();
    } catch (err) {
      setFeedback({
        type: 'danger',
        message: err.response?.data?.message || 'Check-in failed.',
      });
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      const res = await attendanceService.checkOut({ notes });
      setFeedback({ type: 'success', message: res.data.message || 'Checked out successfully!' });
      setNotes('');
      fetchEmployeeData();
    } catch (err) {
      setFeedback({
        type: 'danger',
        message: err.response?.data?.message || 'Check-out failed.',
      });
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading employee workspace..." />;
  }

  const todayAttendance = data?.todayAttendance;
  const isCheckedIn = !!todayAttendance;
  const isCheckedOut = !!(todayAttendance && todayAttendance.checkOut);
  const stats = data?.stats || {};

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-1">My Workplace Dashboard</h3>
          <p className="text-muted small mb-0">
            Log workday attendance, submit leave applications, and view training enrollments
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/leaves" className="btn btn-primary btn-sm d-flex align-items-center gap-1">
            <CalendarOff size={16} /> Apply for Leave
          </Link>
        </div>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type} py-2 px-3 small rounded-3 mb-4`}>
          {feedback.message}
        </div>
      )}

      {/* Top Section: Today's Attendance Punch Card & Stats */}
      <div className="row g-4 mb-4">
        {/* Attendance Punch Box */}
        <div className="col-lg-6">
          <div className="saas-card h-100 border-primary-subtle">
            <div className="saas-card-header bg-primary-subtle border-primary-subtle">
              <div className="d-flex align-items-center gap-2 text-primary fw-bold">
                <Clock size={18} />
                <span>Today's Workday Attendance</span>
              </div>
              <span className="badge bg-white text-primary border small font-monospace">
                {currentTime.toLocaleDateString()}
              </span>
            </div>

            <div className="saas-card-body text-center py-4">
              <h2 className="display-6 fw-bold text-dark mb-1 font-monospace">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </h2>
              <p className="text-muted small mb-4">Server timestamp verified • Standard shift 09:00 AM</p>

              {isCheckedIn && (
                <div className="p-3 bg-light rounded-3 mb-3 text-start small">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Checked in at:</span>
                    <strong className="text-success font-monospace">
                      {new Date(todayAttendance.checkIn).toLocaleTimeString()}
                    </strong>
                  </div>
                  {isCheckedOut && (
                    <>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Checked out at:</span>
                        <strong className="text-primary font-monospace">
                          {new Date(todayAttendance.checkOut).toLocaleTimeString()}
                        </strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Total work hours:</span>
                        <strong className="text-dark">{todayAttendance.workHours} hrs</strong>
                      </div>
                    </>
                  )}
                  {todayAttendance.status === 'late' && (
                    <div className="text-warning small mt-2">
                      <AlertCircle size={14} className="me-1" /> Logged as Late Check-in
                    </div>
                  )}
                </div>
              )}

              {/* Punch Actions */}
              {!isCheckedIn ? (
                <div>
                  <div className="mb-3 text-start">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Optional check-in notes (e.g. Remote, On-site)..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                  <button
                    className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2 fw-semibold"
                    onClick={handleCheckIn}
                    disabled={actionLoading}
                  >
                    <LogIn size={18} /> Check In for Today
                  </button>
                </div>
              ) : !isCheckedOut ? (
                <div>
                  <div className="mb-3 text-start">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Optional check-out summary notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                  <button
                    className="btn btn-warning w-100 py-2 d-flex align-items-center justify-content-center gap-2 fw-semibold"
                    onClick={handleCheckOut}
                    disabled={actionLoading}
                  >
                    <LogOut size={18} /> Check Out for Today
                  </button>
                </div>
              ) : (
                <div className="alert alert-success py-2 px-3 small rounded-3 mb-0 d-flex align-items-center justify-content-center gap-2">
                  <CheckCircle size={16} /> Workday completed. Both check-in and check-out recorded.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="col-lg-6">
          <div className="row g-3 h-100">
            <div className="col-sm-6">
              <StatCard
                title="Monthly Attendance"
                value={`${stats.monthlyAttendanceDays ?? 0} Days`}
                subtitle="Present this month"
                icon={CalendarCheck}
                variant="primary"
              />
            </div>
            <div className="col-sm-6">
              <StatCard
                title="Approved Leaves"
                value={`${stats.approvedLeavesThisYear ?? 0} Days`}
                subtitle="Approved this calendar year"
                icon={CalendarOff}
                variant="success"
              />
            </div>
            <div className="col-sm-6">
              <StatCard
                title="Pending Leaves"
                value={stats.pendingLeavesCount ?? 0}
                subtitle="Under review"
                icon={Clock}
                variant="warning"
              />
            </div>
            <div className="col-sm-6">
              <StatCard
                title="Upcoming Courses"
                value={data?.upcomingTrainings?.length ?? 0}
                subtitle="Catalog programs"
                icon={GraduationCap}
                variant="purple"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Leaves & Company Announcements */}
      <div className="row g-4 mb-4">
        {/* Recent Leave Requests */}
        <div className="col-lg-6">
          <div className="saas-card h-100">
            <div className="saas-card-header">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <CalendarOff size={18} className="text-primary" /> My Recent Leave Requests
              </h6>
              <Link to="/leaves" className="text-primary small text-decoration-none fw-semibold">
                View All
              </Link>
            </div>
            <div className="saas-card-body p-0">
              {data?.recentLeaves?.length === 0 ? (
                <div className="p-4 text-center text-muted small">No leave applications submitted yet.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-saas">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Dates</th>
                        <th>Days</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.recentLeaves?.map((leave) => (
                        <tr key={leave._id}>
                          <td>
                            <span className="badge badge-soft-info text-capitalize small">
                              {leave.leaveType}
                            </span>
                          </td>
                          <td className="small text-muted">
                            {new Date(leave.startDate).toLocaleDateString()} -{' '}
                            {new Date(leave.endDate).toLocaleDateString()}
                          </td>
                          <td className="small fw-semibold">{leave.daysCount}d</td>
                          <td>
                            <span
                              className={`badge ${
                                leave.status === 'approved'
                                  ? 'badge-soft-success'
                                  : leave.status === 'rejected'
                                  ? 'badge-soft-danger'
                                  : 'badge-soft-warning'
                              } text-capitalize`}
                            >
                              {leave.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Company Announcements */}
        <div className="col-lg-6">
          <div className="saas-card h-100">
            <div className="saas-card-header">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <Megaphone size={18} className="text-primary" /> Company Announcements
              </h6>
              <Link to="/announcements" className="text-primary small text-decoration-none fw-semibold">
                All Announcements
              </Link>
            </div>
            <div className="saas-card-body">
              {data?.activeAnnouncements?.length === 0 ? (
                <EmptyState description="No announcements at this time." />
              ) : (
                <div className="d-flex flex-column gap-3">
                  {data?.activeAnnouncements?.map((a) => (
                    <div key={a._id} className="p-3 border rounded-3 bg-light">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="badge badge-soft-primary small text-uppercase" style={{ fontSize: '0.65rem' }}>
                          {a.priority}
                        </span>
                        <span className="text-muted small">{new Date(a.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h6 className="fw-bold text-dark mb-1">{a.title}</h6>
                      <p className="text-muted small mb-0">{a.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
