import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService, leaveService } from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  Users,
  UserCheck,
  CalendarCheck,
  CalendarOff,
  Building,
  GraduationCap,
  Megaphone,
  Check,
  X,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const HRDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchHRStats = async () => {
    try {
      const res = await dashboardService.getHRStats();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load HR dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHRStats();
  }, []);

  const handleReviewLeave = async (id, status) => {
    setActionLoading(true);
    try {
      await leaveService.review(id, { status, reviewNotes: `Decision by HR administrator` });
      setFeedback({ type: 'success', message: `Leave request ${status} successfully.` });
      fetchHRStats();
    } catch (err) {
      setFeedback({
        type: 'danger',
        message: err.response?.data?.message || `Failed to ${status} leave.`,
      });
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Aggregating workforce analytics..." />;
  }

  const stats = data?.stats || {};
  const attendance = stats.attendance || {};

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-1">Human Resources Overview</h3>
          <p className="text-muted small mb-0">
            Real-time workforce metrics, organization attendance, and pending operations
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/employees" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
            <Users size={16} /> Directory
          </Link>
          <Link to="/announcements" className="btn btn-primary btn-sm d-flex align-items-center gap-1">
            <Megaphone size={16} /> New Announcement
          </Link>
        </div>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type} py-2 px-3 small rounded-3 mb-4`}>
          {feedback.message}
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatCard
            title="Total Employees"
            value={stats.totalEmployees ?? 0}
            subtitle={`${stats.activeEmployees ?? 0} Active Staff`}
            icon={Users}
            variant="primary"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            title="Managers"
            value={stats.totalManagers ?? 0}
            subtitle="Department Leads"
            icon={UserCheck}
            variant="info"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            title="Today's Attendance"
            value={`${attendance.present ?? 0} / ${stats.totalEmployees ?? 0}`}
            subtitle={`${attendance.late ?? 0} Late, ${attendance.absent ?? 0} Absent`}
            icon={CalendarCheck}
            variant="success"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            title="Pending Leaves"
            value={stats.pendingLeaves ?? 0}
            subtitle="Awaiting decision"
            icon={CalendarOff}
            variant={stats.pendingLeaves > 0 ? 'warning' : 'purple'}
          />
        </div>
      </div>

      {/* Middle Row: Department Distribution & Attendance Breakdown */}
      <div className="row g-4 mb-4">
        {/* Attendance Breakdown Bar */}
        <div className="col-lg-6">
          <div className="saas-card h-100">
            <div className="saas-card-header">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <CalendarCheck size={18} className="text-primary" /> Today's Attendance Pulse
              </h6>
              <Link to="/attendance" className="text-primary small text-decoration-none fw-semibold">
                Full Log
              </Link>
            </div>
            <div className="saas-card-body">
              <div className="row text-center mb-3 g-2">
                <div className="col-4">
                  <div className="p-3 bg-light rounded-3">
                    <span className="text-muted small d-block">Present</span>
                    <h4 className="fw-bold text-success mb-0">{attendance.present ?? 0}</h4>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-3 bg-light rounded-3">
                    <span className="text-muted small d-block">Late</span>
                    <h4 className="fw-bold text-warning mb-0">{attendance.late ?? 0}</h4>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-3 bg-light rounded-3">
                    <span className="text-muted small d-block">Absent</span>
                    <h4 className="fw-bold text-danger mb-0">{attendance.absent ?? 0}</h4>
                  </div>
                </div>
              </div>

              {/* Progress visualizer */}
              <div className="progress" style={{ height: '10px' }}>
                <div
                  className="progress-bar bg-success"
                  style={{
                    width: `${stats.totalEmployees ? ((attendance.present || 0) / stats.totalEmployees) * 100 : 0}%`,
                  }}
                  title="Present"
                />
                <div
                  className="progress-bar bg-warning"
                  style={{
                    width: `${stats.totalEmployees ? ((attendance.late || 0) / stats.totalEmployees) * 100 : 0}%`,
                  }}
                  title="Late"
                />
                <div
                  className="progress-bar bg-danger"
                  style={{
                    width: `${stats.totalEmployees ? ((attendance.absent || 0) / stats.totalEmployees) * 100 : 0}%`,
                  }}
                  title="Absent"
                />
              </div>
              <div className="d-flex justify-content-between text-muted small mt-2">
                <span>0</span>
                <span>Total Headcount: {stats.totalEmployees ?? 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Department Distribution */}
        <div className="col-lg-6">
          <div className="saas-card h-100">
            <div className="saas-card-header">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <Building size={18} className="text-primary" /> Headcount by Department
              </h6>
              <span className="badge badge-soft-primary">{data?.departmentDistribution?.length || 0} Departments</span>
            </div>
            <div className="saas-card-body">
              {data?.departmentDistribution?.length === 0 ? (
                <EmptyState description="No department data available." />
              ) : (
                <div className="d-flex flex-column gap-3">
                  {data?.departmentDistribution?.map((dept, index) => {
                    const pct = stats.totalEmployees ? Math.round((dept.count / stats.totalEmployees) * 100) : 0;
                    return (
                      <div key={index}>
                        <div className="d-flex justify-content-between small fw-medium mb-1">
                          <span className="text-dark">{dept.department}</span>
                          <span className="text-muted">
                            {dept.count} ({pct}%)
                          </span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div
                            className="progress-bar bg-primary"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pending Leave Requests Section */}
      <div className="saas-card mb-4">
        <div className="saas-card-header">
          <div className="d-flex align-items-center gap-2">
            <CalendarOff size={18} className="text-warning" />
            <h6 className="fw-bold text-dark mb-0">Pending Leave Approvals</h6>
            {data?.recentLeaves?.length > 0 && (
              <span className="badge bg-warning text-dark rounded-pill px-2">
                {data.recentLeaves.length}
              </span>
            )}
          </div>
          <Link to="/leaves" className="text-primary small text-decoration-none fw-semibold">
            View All Leaves <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-responsive">
          {data?.recentLeaves?.length === 0 ? (
            <div className="p-4 text-center text-muted small">No pending leave requests at this moment.</div>
          ) : (
            <table className="table table-saas">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentLeaves?.map((leave) => (
                  <tr key={leave._id}>
                    <td>
                      <div className="fw-bold text-dark">{leave.user?.name}</div>
                      <div className="text-muted small">{leave.user?.email}</div>
                    </td>
                    <td>
                      <span className="badge badge-soft-info text-capitalize">{leave.leaveType}</span>
                    </td>
                    <td className="small text-muted">
                      {new Date(leave.startDate).toLocaleDateString()} -{' '}
                      {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className="fw-semibold">{leave.daysCount}d</td>
                    <td className="small text-muted text-truncate" style={{ maxWidth: '240px' }}>
                      {leave.reason}
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-success d-flex align-items-center gap-1"
                          onClick={() => handleReviewLeave(leave._id, 'approved')}
                          disabled={actionLoading}
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          className="btn btn-outline-danger d-flex align-items-center gap-1"
                          onClick={() => handleReviewLeave(leave._id, 'rejected')}
                          disabled={actionLoading}
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Recent Announcements */}
      <div className="saas-card">
        <div className="saas-card-header">
          <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            <Megaphone size={18} className="text-primary" /> Company Announcements
          </h6>
          <Link to="/announcements" className="text-primary small text-decoration-none fw-semibold">
            Manage <ArrowRight size={14} />
          </Link>
        </div>
        <div className="saas-card-body">
          {data?.recentAnnouncements?.length === 0 ? (
            <EmptyState description="No company announcements published yet." />
          ) : (
            <div className="row g-3">
              {data?.recentAnnouncements?.map((a) => (
                <div key={a._id} className="col-md-6">
                  <div className="p-3 border rounded-3 bg-light h-100">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="badge badge-soft-primary text-uppercase" style={{ fontSize: '0.65rem' }}>
                        {a.priority} Priority
                      </span>
                      <span className="text-muted small">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h6 className="fw-bold text-dark mb-1">{a.title}</h6>
                    <p className="text-muted small mb-2" style={{ lineHeight: '1.4' }}>
                      {a.content.length > 130 ? `${a.content.substring(0, 130)}...` : a.content}
                    </p>
                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                      Posted by {a.authorName} • Audience: {a.targetRole.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
