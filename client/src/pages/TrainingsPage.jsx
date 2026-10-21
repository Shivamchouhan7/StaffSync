import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { trainingService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  GraduationCap,
  Plus,
  Users,
  Calendar,
  CheckCircle,
  UserCheck,
  BookOpen,
} from 'lucide-react';

const TrainingsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const canManage = user?.role === 'hr' || user?.role === 'manager';

  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    department: 'Engineering',
    trainer: '',
    startDate: '',
    endDate: '',
    capacity: 25,
  });

  const fetchTrainings = async () => {
    setLoading(true);
    try {
      const res = await trainingService.getAll();
      setTrainings(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const handleEnroll = async (id) => {
    setActionLoading(true);
    try {
      const res = await trainingService.enroll(id);
      setFeedback({ type: 'success', message: res.data.message || 'Successfully enrolled!' });
      fetchTrainings();
    } catch (err) {
      setFeedback({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to enroll in training.',
      });
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await trainingService.create(formData);
      setFeedback({ type: 'success', message: 'Training program scheduled successfully!' });
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        category: 'Technical',
        department: 'Engineering',
        trainer: '',
        startDate: '',
        endDate: '',
        capacity: 25,
      });
      fetchTrainings();
    } catch (err) {
      setFeedback({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to create training program.',
      });
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-1">Corporate Training & Upskilling</h3>
          <p className="text-muted small mb-0">
            Professional development courses, compliance certifications, and technical workshops
          </p>
        </div>
        {canManage && (
          <button
            className="btn btn-primary d-flex align-items-center gap-1"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} /> Schedule Training
          </button>
        )}
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type} py-2 px-3 small rounded-3 mb-4`}>
          {feedback.message}
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading course curriculum..." />
      ) : trainings.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No training programs"
          description="There are currently no active training courses scheduled."
        />
      ) : (
        <div className="row g-4">
          {trainings.map((t) => {
            const isEnrolled = t.enrolledUsers?.some(
              (item) => item.user?._id === user?._id || item.user === user?._id
            );
            const enrolledCount = t.enrolledUsers?.length || 0;
            const isFull = enrolledCount >= t.capacity;

            return (
              <div key={t._id} className="col-lg-6">
                <div className="saas-card h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="saas-card-header">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge badge-soft-primary">{t.category}</span>
                        <span className="badge badge-soft-secondary">{t.department}</span>
                      </div>
                      <span className="badge badge-soft-success text-capitalize">{t.status}</span>
                    </div>

                    <div className="saas-card-body">
                      <h5 className="fw-bold text-dark mb-2">{t.title}</h5>
                      <p className="text-muted small mb-3" style={{ lineHeight: '1.45' }}>
                        {t.description}
                      </p>

                      <div className="p-3 bg-light rounded-3 mb-3 small">
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-muted">Instructor:</span>
                          <strong className="text-dark">{t.trainer}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-muted">Schedule:</span>
                          <strong>
                            {new Date(t.startDate).toLocaleDateString()} -{' '}
                            {new Date(t.endDate).toLocaleDateString()}
                          </strong>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Capacity:</span>
                          <strong>
                            {enrolledCount} / {t.capacity} Seats Filled
                          </strong>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="progress mb-2" style={{ height: '6px' }}>
                        <div
                          className={`progress-bar ${isFull ? 'bg-danger' : 'bg-primary'}`}
                          style={{ width: `${Math.min(100, (enrolledCount / t.capacity) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 px-4 border-top d-flex justify-content-between align-items-center bg-light rounded-bottom">
                    {canManage && (
                      <button
                        className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                        onClick={() => {
                          setSelectedTraining(t);
                          setShowRosterModal(true);
                        }}
                      >
                        <Users size={14} /> View Roster ({enrolledCount})
                      </button>
                    )}

                    {isEnrolled ? (
                      <span className="badge bg-success-subtle text-success border border-success-subtle d-flex align-items-center gap-1 p-2">
                        <CheckCircle size={14} /> Enrolled
                      </span>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm ms-auto"
                        disabled={isFull || actionLoading}
                        onClick={() => handleEnroll(t._id)}
                      >
                        {isFull ? 'Course Full' : 'Enroll Now'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Training Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Schedule Training Program</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                />
              </div>
              <form onSubmit={handleCreateSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Program Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="e.g. AWS Cloud Security Best Practices"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Category *</label>
                      <select
                        className="form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="Technical">Technical</option>
                        <option value="Compliance">Compliance</option>
                        <option value="Leadership">Leadership</option>
                        <option value="Soft Skills">Soft Skills</option>
                        <option value="Onboarding">Onboarding</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Target Department</label>
                      <select
                        className="form-select"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      >
                        <option value="All">All Departments</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Product & Design">Product & Design</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Sales">Sales</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Operations">Operations</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Instructor / Trainer *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="e.g. Sarah Jenkins"
                        value={formData.trainer}
                        onChange={(e) => setFormData({ ...formData, trainer: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Seat Capacity *</label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        max="200"
                        required
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Start Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">End Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Description *</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        required
                        placeholder="Describe key learning outcomes and modules..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                    Create Training Program
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Enrolled Roster Modal */}
      {showRosterModal && selectedTraining && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">
                  Enrolled Roster: {selectedTraining.title}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRosterModal(false)}
                />
              </div>
              <div className="modal-body p-4" style={{ maxHeight: '380px', overflowY: 'auto' }}>
                {selectedTraining.enrolledUsers?.length === 0 ? (
                  <div className="p-3 text-center text-muted small">No participants enrolled yet.</div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {selectedTraining.enrolledUsers.map((e, idx) => (
                      <div
                        key={idx}
                        className="p-2 px-3 border rounded-3 bg-light d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <span className="fw-bold small d-block">{e.user?.name || 'Staff Member'}</span>
                          <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                            {e.user?.email} • Enrolled {new Date(e.enrolledAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="badge badge-soft-success text-capitalize">{e.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer border-top">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowRosterModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingsPage;
