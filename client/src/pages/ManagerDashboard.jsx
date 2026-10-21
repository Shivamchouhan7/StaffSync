import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService, leaveService } from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  Users,
  CalendarCheck,
  CalendarOff,
  GraduationCap,
  Award,
  Check,
  X,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

const ManagerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchManagerData = async () => {
    try {
      const res = await dashboardService.getManagerStats();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load Manager dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagerData();
  }, []);

  const handleReviewLeave = async (id, status) => {
    setActionLoading(true);
    try {
      await leaveService.review(id, {
        status,
        reviewNotes: `Decision by assigned team manager`,
      });
      setFeedback({ type: 'success', message: `Team leave request ${status} successfully.` });
      fetchManagerData();
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
    return <LoadingSpinner message="Loading team operations dashboard..." />;
  }

  const stats = data?.stats || {};
  const attendance = stats.attendance || {};

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-1">Team Management Workspace</h3>
          <p className="text-muted small mb-0">
            Monitor direct reports, review leave applications, and manage team training
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/trainings" className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1">
            <GraduationCap size={16} /> Manage Trainings
          </Link>
          <Link to="/performance" className="btn btn-primary btn-sm d-flex align-items-center gap-1">
            <Award size={16} /> Review Performance
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
            title="Team Members"
            value={stats.teamSize ?? 0}
            subtitle="Assigned Direct Reports"
            icon={Users}
            variant="primary"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            title="Present Today"
            value={`${attendance.present ?? 0} / ${stats.teamSize ?? 0}`}
            subtitle={`${attendance.late ?? 0} Late, ${attendance.absent ?? 0} Absent`}
            icon={CalendarCheck}
            variant="success"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            title="Team Leave Requests"
            value={stats.pendingLeavesCount ?? 0}
            subtitle="Pending your decision"
            icon={CalendarOff}
            variant={stats.pendingLeavesCount > 0 ? 'warning' : 'info'}
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            title="Team Trainings"
            value={stats.trainingsCount ?? 0}
            subtitle="Active Programs"
            icon={GraduationCap}
            variant="purple"
          />
        </div>
      </div>

      {/* Team Members & Attendance Snapshot */}
      <div className="row g-4 mb-4">
        <div className="col-lg-7">
          <div className="saas-card h-100">
            <div className="saas-card-header">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <Users size={18} className="text-primary" /> Direct Reports & Today's Attendance
              </h6>
              <span className="badge badge-soft-primary">{data?.teamMembers?.length || 0} Members</span>
            </div>

            <div className="table-responsive">
              {data?.teamMembers?.length === 0 ? (
                <div className="p-4 text-center text-muted small">
                  No employees are currently assigned to your team. Contact HR for team allocation.
                </div>
              ) : (
                <table className="table table-saas">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Designation</th>
                      <th>Status Today</th>
                      <th>Check-In</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.teamMembers?.map((emp) => {
                      // Check if member checked in today
                      const att = data?.todayAttendance?.find(
                        (a) => a.user?._id?.toString() === emp.user?._id?.toString()
                      );

                      return (
                        <tr key={emp._id}>
                          <td>
                            <div className="fw-bold text-dark">{emp.user?.name}</div>
                            <div className="text-muted small">{emp.user?.email}</div>
                          </td>
                          <td className="small text-muted">{emp.designation}</td>
                          <td>
                            {att ? (
                              <span
                                className={`badge ${
                                  att.status === 'present'
                                    ? 'badge-soft-success'
                                    : att.status === 'late'
                                    ? 'badge-soft-warning'
                                    : 'badge-soft-secondary'
                                } text-capitalize`}
                              >
                                {att.status}
                              </span>
                            ) : (
                              <span className="badge badge-soft-danger">Not Checked In</span>
                            )}
                          </td>
                          <td className="small text-muted">
                            {att?.checkIn
                              ? new Date(att.checkIn).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Pending Team Leaves */}
        <div className="col-lg-5">
          <div className="saas-card h-100">
            <div className="saas-card-header">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <CalendarOff size={18} className="text-warning" /> Team Leave Approvals
              </h6>
              <Link to="/leaves" className="text-primary small text-decoration-none fw-semibold">
                Manage
              </Link>
            </div>

            <div className="saas-card-body p-0">
              {data?.teamPendingLeaves?.length === 0 ? (
                <div className="p-4 text-center text-muted small">
                  No pending leave requests from your team members.
                </div>
              ) : (
                <div className="p-3 d-flex flex-column gap-3">
                  {data?.teamPendingLeaves?.map((leave) => (
                    <div key={leave._id} className="p-3 border rounded-3 bg-light">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <span className="fw-bold text-dark d-block">{leave.user?.name}</span>
                          <span className="badge badge-soft-info text-capitalize small">
                            {leave.leaveType} ({leave.daysCount}d)
                          </span>
                        </div>
                        <span className="text-muted small">
                          {new Date(leave.startDate).toLocaleDateString()} -{' '}
                          {new Date(leave.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-muted small mb-3">{leave.reason}</p>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-success flex-1 d-flex align-items-center justify-content-center gap-1"
                          onClick={() => handleReviewLeave(leave._id, 'approved')}
                          disabled={actionLoading}
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger flex-1 d-flex align-items-center justify-content-center gap-1"
                          onClick={() => handleReviewLeave(leave._id, 'rejected')}
                          disabled={actionLoading}
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Team Trainings Overview */}
      <div className="saas-card">
        <div className="saas-card-header">
          <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            <GraduationCap size={18} className="text-primary" /> Active Team Training Programs
          </h6>
          <Link to="/trainings" className="text-primary small text-decoration-none fw-semibold">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="saas-card-body">
          {data?.teamTrainings?.length === 0 ? (
            <EmptyState description="No training programs scheduled for your team yet." />
          ) : (
            <div className="row g-3">
              {data?.teamTrainings?.map((t) => (
                <div key={t._id} className="col-md-6 col-lg-4">
                  <div className="p-3 border rounded-3 bg-light h-100">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="badge badge-soft-primary small">{t.category}</span>
                      <span className="badge badge-soft-success text-capitalize small">{t.status}</span>
                    </div>
                    <h6 className="fw-bold text-dark mb-1">{t.title}</h6>
                    <p className="text-muted small mb-2 text-truncate">{t.description}</p>
                    <div className="d-flex justify-content-between text-muted small mt-2 pt-2 border-top">
                      <span>Trainer: {t.trainer}</span>
                      <span>Enrolled: {t.enrolledUsers?.length || 0} / {t.capacity}</span>
                    </div>
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

export default ManagerDashboard;
