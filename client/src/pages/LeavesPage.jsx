import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { leaveService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  CalendarOff,
  Plus,
  Check,
  X,
  AlertCircle,
  Clock,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

const LeavesPage = () => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role || 'employee';
  const isHR = role === 'hr';
  const isManager = role === 'manager';

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [applyForm, setApplyForm] = useState({
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      let res;
      if (isHR) {
        res = await leaveService.getAllLeaves({
          status: activeTab === 'all' ? undefined : activeTab,
        });
      } else if (isManager) {
        res = await leaveService.getTeamLeaves({
          status: activeTab === 'all' ? undefined : activeTab,
        });
      } else {
        res = await leaveService.getMyLeaves();
      }
      setLeaves(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [activeTab]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await leaveService.apply(applyForm);
      setFeedback({ type: 'success', message: 'Leave request submitted successfully!' });
      setShowApplyModal(false);
      setApplyForm({ leaveType: 'annual', startDate: '', endDate: '', reason: '' });
      fetchLeaves();
    } catch (err) {
      setFeedback({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to submit leave request.',
      });
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const openReviewModal = (leave, status) => {
    setSelectedLeave(leave);
    setReviewStatus(status);
    setReviewNotes('');
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await leaveService.review(selectedLeave._id, {
        status: reviewStatus,
        reviewNotes,
      });
      setFeedback({
        type: 'success',
        message: `Leave request ${reviewStatus} successfully!`,
      });
      setShowReviewModal(false);
      setSelectedLeave(null);
      fetchLeaves();
    } catch (err) {
      setFeedback({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to process decision.',
      });
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleCancelLeave = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this leave application?')) return;
    try {
      await leaveService.cancel(id);
      setFeedback({ type: 'success', message: 'Leave request cancelled.' });
      fetchLeaves();
    } catch (err) {
      setFeedback({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to cancel leave.',
      });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  // Filter tab list for employee view
  const filteredLeaves =
    !isHR && !isManager && activeTab !== 'all'
      ? leaves.filter((l) => l.status === activeTab)
      : leaves;

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-1">
            {isHR
              ? 'Organization Leave Applications'
              : isManager
              ? 'Team Leave Approvals'
              : 'My Leave Applications'}
          </h3>
          <p className="text-muted small mb-0">
            {isHR
              ? 'Approve or reject organization-wide leaves according to company policies'
              : isManager
              ? 'Review and manage time-off requests from direct reports'
              : 'Submit time-off requests and track approval statuses'}
          </p>
        </div>
        <button
          className="btn btn-primary d-flex align-items-center gap-1"
          onClick={() => setShowApplyModal(true)}
        >
          <Plus size={16} /> Apply for Leave
        </button>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type} py-2 px-3 small rounded-3 mb-4`}>
          {feedback.message}
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="d-flex gap-2 mb-3 border-bottom pb-2">
        {['all', 'pending', 'approved', 'rejected'].map((tab) => (
          <button
            key={tab}
            className={`btn btn-sm text-capitalize ${
              activeTab === tab ? 'btn-primary' : 'btn-light border'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Leaves Table */}
      <div className="saas-card">
        <div className="table-responsive">
          {loading ? (
            <LoadingSpinner message="Loading leave applications..." />
          ) : filteredLeaves.length === 0 ? (
            <EmptyState
              icon={CalendarOff}
              title="No leave records"
              description="No applications found for the selected view."
            />
          ) : (
            <table className="table table-saas">
              <thead>
                <tr>
                  {(isHR || isManager) && <th>Applicant</th>}
                  <th>Type</th>
                  <th>Duration</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Decision Details</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map((leave) => (
                  <tr key={leave._id}>
                    {(isHR || isManager) && (
                      <td>
                        <span className="fw-bold text-dark d-block">{leave.user?.name}</span>
                        <span className="text-muted small">{leave.user?.email}</span>
                      </td>
                    )}
                    <td>
                      <span className="badge badge-soft-info text-capitalize">{leave.leaveType}</span>
                    </td>
                    <td className="small text-muted font-monospace">
                      {new Date(leave.startDate).toLocaleDateString()} -{' '}
                      {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className="fw-semibold text-dark">{leave.daysCount}d</td>
                    <td className="small text-muted text-truncate" style={{ maxWidth: '200px' }}>
                      {leave.reason}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          leave.status === 'approved'
                            ? 'badge-soft-success'
                            : leave.status === 'rejected'
                            ? 'badge-soft-danger'
                            : leave.status === 'cancelled'
                            ? 'badge-soft-secondary'
                            : 'badge-soft-warning'
                        } text-capitalize`}
                      >
                        {leave.status}
                      </span>
                    </td>
                    <td className="small text-muted">
                      {leave.reviewedBy ? (
                        <div>
                          <span>By {leave.reviewedBy.name}</span>
                          {leave.reviewNotes && (
                            <span className="d-block text-truncate" style={{ maxWidth: '160px' }}>
                              "{leave.reviewNotes}"
                            </span>
                          )}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="text-end">
                      {/* HR or Manager reviewing pending leave */}
                      {(isHR || isManager) && leave.status === 'pending' && (
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-success d-flex align-items-center gap-1"
                            onClick={() => openReviewModal(leave, 'approved')}
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            className="btn btn-outline-danger d-flex align-items-center gap-1"
                            onClick={() => openReviewModal(leave, 'rejected')}
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      )}

                      {/* Self cancellation */}
                      {leave.user?._id === user?._id && leave.status === 'pending' && (
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleCancelLeave(leave._id)}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Submit Leave Request</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowApplyModal(false)}
                />
              </div>
              <form onSubmit={handleApplySubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Leave Type *</label>
                    <select
                      className="form-select"
                      value={applyForm.leaveType}
                      onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value })}
                      required
                    >
                      <option value="annual">Annual Leave</option>
                      <option value="sick">Sick Leave</option>
                      <option value="casual">Casual Leave</option>
                      <option value="maternity">Maternity Leave</option>
                      <option value="paternity">Paternity Leave</option>
                      <option value="unpaid">Unpaid Leave</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Start Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={applyForm.startDate}
                        onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">End Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={applyForm.endDate}
                        onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Reason for Absence *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Please specify context or reasons..."
                      required
                      value={applyForm.reason}
                      onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowApplyModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                    Submit Application
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Review Leave Modal */}
      {showReviewModal && selectedLeave && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-capitalize">
                  {reviewStatus} Leave Request
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowReviewModal(false)}
                />
              </div>
              <form onSubmit={handleReviewSubmit}>
                <div className="modal-body p-4">
                  <div className="p-3 bg-light rounded-3 mb-3 small">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Applicant:</span>
                      <strong>{selectedLeave.user?.name}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Type:</span>
                      <strong className="text-capitalize">{selectedLeave.leaveType}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Duration:</span>
                      <strong>
                        {new Date(selectedLeave.startDate).toLocaleDateString()} to{' '}
                        {new Date(selectedLeave.endDate).toLocaleDateString()} ({selectedLeave.daysCount}d)
                      </strong>
                    </div>
                    <div className="mt-2 pt-2 border-top">
                      <span className="text-muted d-block">Reason:</span>
                      <em>"{selectedLeave.reason}"</em>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">
                      Review / Decision Notes (Optional)
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Add any conditional notes or feedback for the applicant..."
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowReviewModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn ${reviewStatus === 'approved' ? 'btn-success' : 'btn-danger'}`}
                    disabled={actionLoading}
                  >
                    Confirm {reviewStatus === 'approved' ? 'Approval' : 'Rejection'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeavesPage;
