import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { attendanceService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  CalendarCheck,
  Calendar,
  Clock,
  Filter,
  CheckCircle,
  LogIn,
  LogOut,
  AlertCircle,
} from 'lucide-react';

const AttendancePage = () => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role || 'employee';

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDept, setFilterDept] = useState('All');
  const [todayRecord, setTodayRecord] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState(null);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      if (role === 'hr') {
        const res = await attendanceService.getAllAttendance({
          date: filterDate,
          status: filterStatus,
          department: filterDept,
        });
        setRecords(res.data.data || []);
      } else if (role === 'manager') {
        const res = await attendanceService.getTeamAttendance({
          date: filterDate,
          status: filterStatus,
        });
        setRecords(res.data.data || []);
      } else {
        // Employee
        const res = await attendanceService.getMyAttendance();
        setRecords(res.data.data || []);
        setTodayRecord(res.data.today || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [filterDate, filterStatus, filterDept]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      const res = await attendanceService.checkIn({ notes });
      setFeedback({ type: 'success', message: res.data.message });
      setNotes('');
      fetchAttendance();
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
      setFeedback({ type: 'success', message: res.data.message });
      setNotes('');
      fetchAttendance();
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

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-1">
            {role === 'hr'
              ? 'Organization Attendance Records'
              : role === 'manager'
              ? 'Team Attendance Logs'
              : 'My Attendance History'}
          </h3>
          <p className="text-muted small mb-0">
            {role === 'hr'
              ? 'Real-time work hours, punctuality metrics, and audit timestamps across all units'
              : role === 'manager'
              ? 'Review check-ins and hours completed by your direct reports'
              : 'Personal workday logs and verification timestamps'}
          </p>
        </div>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type} py-2 px-3 small rounded-3 mb-4`}>
          {feedback.message}
        </div>
      )}

      {/* Employee Quick Punch Card */}
      {role === 'employee' && (
        <div className="saas-card mb-4 p-4 bg-primary-subtle border-primary-subtle">
          <div className="row align-items-center g-3">
            <div className="col-md-7">
              <h5 className="fw-bold text-primary mb-1 d-flex align-items-center gap-2">
                <Clock size={20} /> Workday Check-In Console
              </h5>
              <p className="text-muted small mb-0">
                {todayRecord ? (
                  todayRecord.checkOut ? (
                    <span className="text-success fw-medium">
                      ✓ Checked in at {new Date(todayRecord.checkIn).toLocaleTimeString()} • Checked out at{' '}
                      {new Date(todayRecord.checkOut).toLocaleTimeString()} ({todayRecord.workHours}h total)
                    </span>
                  ) : (
                    <span className="text-dark fw-medium">
                      Checked in at {new Date(todayRecord.checkIn).toLocaleTimeString()}. Remember to check out at end of shift.
                    </span>
                  )
                ) : (
                  'You have not marked attendance for today yet.'
                )}
              </p>
            </div>
            <div className="col-md-5 text-md-end">
              {!todayRecord ? (
                <button
                  className="btn btn-primary d-inline-flex align-items-center gap-2 px-4"
                  onClick={handleCheckIn}
                  disabled={actionLoading}
                >
                  <LogIn size={18} /> Check In Today
                </button>
              ) : !todayRecord.checkOut ? (
                <button
                  className="btn btn-warning d-inline-flex align-items-center gap-2 px-4"
                  onClick={handleCheckOut}
                  disabled={actionLoading}
                >
                  <LogOut size={18} /> Check Out Today
                </button>
              ) : (
                <span className="badge bg-success-subtle text-success border border-success-subtle p-2 px-3 fs-6">
                  Completed Today
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar (HR & Manager) */}
      {role !== 'employee' && (
        <div className="saas-card mb-4 p-3">
          <div className="row g-2 align-items-center">
            <div className="col-md-4">
              <label className="form-label small text-muted mb-1">Filter by Date</label>
              <input
                type="date"
                className="form-control"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label small text-muted mb-1">Status</label>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="half_day">Half Day</option>
              </select>
            </div>
            {role === 'hr' && (
              <div className="col-md-3">
                <label className="form-label small text-muted mb-1">Department</label>
                <select
                  className="form-select"
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                >
                  <option value="All">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Product & Design">Product & Design</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
            )}
            <div className="col-md-1 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setFilterDate('');
                  setFilterStatus('All');
                  setFilterDept('All');
                }}
                title="Reset filters"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      <div className="saas-card">
        <div className="table-responsive">
          {loading ? (
            <LoadingSpinner message="Loading attendance logs..." />
          ) : records.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="No attendance records"
              description="No attendance logs found matching the selected criteria."
            />
          ) : (
            <table className="table table-saas">
              <thead>
                <tr>
                  {role !== 'employee' && <th>Employee</th>}
                  <th>Workday Date</th>
                  <th>Check-In Time</th>
                  <th>Check-Out Time</th>
                  <th>Total Hours</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr key={rec._id}>
                    {role !== 'employee' && (
                      <td>
                        <span className="fw-bold text-dark d-block">{rec.user?.name}</span>
                        <span className="text-muted small">{rec.user?.email}</span>
                      </td>
                    )}
                    <td className="fw-semibold text-dark font-monospace">{rec.date}</td>
                    <td className="small text-muted font-monospace">
                      {new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="small text-muted font-monospace">
                      {rec.checkOut
                        ? new Date(rec.checkOut).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </td>
                    <td className="fw-semibold text-dark">
                      {rec.workHours ? `${rec.workHours} hrs` : 'In progress'}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          rec.status === 'present'
                            ? 'badge-soft-success'
                            : rec.status === 'late'
                            ? 'badge-soft-warning'
                            : 'badge-soft-secondary'
                        } text-capitalize`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="small text-muted text-truncate" style={{ maxWidth: '200px' }}>
                      {rec.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
