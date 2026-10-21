import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { performanceService, employeeService, managerService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  Award,
  Plus,
  Star,
  CheckCircle,
  TrendingUp,
  User,
  Calendar,
  Sparkles,
} from 'lucide-react';

const PerformancePage = () => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role || 'employee';
  const canReview = role === 'hr' || role === 'manager';

  const [reviews, setReviews] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    user: '',
    reviewPeriod: 'Q1 2026',
    rating: 5,
    feedback: '',
    goalsMet: 4,
    totalGoals: 5,
    keyAchievementsText: '',
    areasOfImprovementText: '',
  });

  const fetchReviews = async () => {
    setLoading(true);
    try {
      let res;
      if (role === 'hr') {
        res = await performanceService.getAllPerformance();
      } else if (role === 'manager') {
        res = await performanceService.getTeamPerformance();
      } else {
        res = await performanceService.getMyPerformance();
      }
      setReviews(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewableCandidates = async () => {
    if (!canReview) return;
    try {
      if (role === 'hr') {
        const res = await employeeService.getAll({ limit: 100 });
        setCandidates(res.data.data || []);
      } else if (role === 'manager') {
        const res = await managerService.getMyTeam();
        setCandidates(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchReviewableCandidates();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        user: formData.user,
        reviewPeriod: formData.reviewPeriod,
        rating: Number(formData.rating),
        feedback: formData.feedback,
        goalsMet: Number(formData.goalsMet),
        totalGoals: Number(formData.totalGoals),
        keyAchievements: formData.keyAchievementsText
          ? formData.keyAchievementsText.split(',').map((s) => s.trim())
          : [],
        areasOfImprovement: formData.areasOfImprovementText
          ? formData.areasOfImprovementText.split(',').map((s) => s.trim())
          : [],
      };

      await performanceService.create(payload);
      setFeedback({ type: 'success', message: 'Performance appraisal recorded successfully!' });
      setShowModal(false);
      setFormData({
        user: '',
        reviewPeriod: 'Q1 2026',
        rating: 5,
        feedback: '',
        goalsMet: 4,
        totalGoals: 5,
        keyAchievementsText: '',
        areasOfImprovementText: '',
      });
      fetchReviews();
    } catch (err) {
      setFeedback({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to submit review.',
      });
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="d-inline-flex align-items-center gap-1 text-warning">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            fill={star <= Math.round(rating) ? '#f59e0b' : 'none'}
            color="#f59e0b"
          />
        ))}
        <span className="ms-1 small fw-bold text-dark">{rating.toFixed(1)} / 5</span>
      </div>
    );
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-1">
            {role === 'employee' ? 'My Performance Appraisals' : 'Performance Evaluation Records'}
          </h3>
          <p className="text-muted small mb-0">
            {role === 'employee'
              ? 'Explicit appraisal assessments, key milestones achieved, and supervisory feedback'
              : 'Conduct structured performance assessments for your reporting workforce'}
          </p>
        </div>
        {canReview && (
          <button
            className="btn btn-primary d-flex align-items-center gap-1"
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} /> Conduct Review
          </button>
        )}
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type} py-2 px-3 small rounded-3 mb-4`}>
          {feedback.message}
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading performance evaluation records..." />
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No performance reviews recorded"
          description={
            canReview
              ? 'Click "Conduct Review" to log an explicit evaluation record for team members.'
              : 'You do not have any published appraisals yet.'
          }
        />
      ) : (
        <div className="row g-4">
          {reviews.map((rev) => (
            <div key={rev._id} className="col-lg-6">
              <div className="saas-card h-100">
                <div className="saas-card-header bg-light">
                  <div>
                    <h6 className="fw-bold text-dark mb-0">
                      {role === 'employee' ? `Review: ${rev.reviewPeriod}` : rev.user?.name}
                    </h6>
                    <span className="text-muted small">
                      Evaluated by {rev.reviewer?.name} ({rev.reviewer?.role?.toUpperCase()})
                    </span>
                  </div>
                  <span className="badge badge-soft-primary font-monospace">{rev.reviewPeriod}</span>
                </div>

                <div className="saas-card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded-3">
                    <div>
                      <span className="text-muted small d-block">Overall Score</span>
                      {renderStars(rev.rating)}
                    </div>
                    <div className="text-end">
                      <span className="text-muted small d-block">Milestones Completed</span>
                      <strong className="text-success fs-6">
                        {rev.goalsMet} of {rev.totalGoals} Goals
                      </strong>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className="text-muted small fw-semibold d-block mb-1">Feedback:</span>
                    <p className="text-secondary small mb-0" style={{ lineHeight: '1.5' }}>
                      "{rev.feedback}"
                    </p>
                  </div>

                  {rev.keyAchievements?.length > 0 && (
                    <div className="mb-3">
                      <span className="text-muted small fw-semibold d-block mb-1">
                        Key Achievements:
                      </span>
                      <ul className="mb-0 ps-3 small text-muted">
                        {rev.keyAchievements.map((ach, i) => (
                          <li key={i}>{ach}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {rev.areasOfImprovement?.length > 0 && (
                    <div className="mt-2 pt-2 border-top">
                      <span className="text-muted small fw-semibold d-block mb-1">
                        Areas of Growth:
                      </span>
                      <ul className="mb-0 ps-3 small text-muted">
                        {rev.areasOfImprovement.map((area, i) => (
                          <li key={i}>{area}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Conduct Review Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Log Performance Evaluation</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Employee *</label>
                      <select
                        className="form-select"
                        required
                        value={formData.user}
                        onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                      >
                        <option value="">Select Employee...</option>
                        {candidates.map((c) => (
                          <option key={c.user?._id} value={c.user?._id}>
                            {c.user?.name} ({c.department} - {c.designation})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Review Period *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="e.g. Q1 2026"
                        value={formData.reviewPeriod}
                        onChange={(e) => setFormData({ ...formData, reviewPeriod: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Rating (1 to 5) *</label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        max="5"
                        step="0.1"
                        required
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Goals Met *</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        required
                        value={formData.goalsMet}
                        onChange={(e) => setFormData({ ...formData, goalsMet: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Total Goals *</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        required
                        value={formData.totalGoals}
                        onChange={(e) => setFormData({ ...formData, totalGoals: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Detailed Feedback *</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        required
                        placeholder="Provide concrete evaluation of results, initiatives, and contributions..."
                        value={formData.feedback}
                        onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">
                        Key Achievements (Comma separated)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Delivered Vite migration, Reduced API latency by 30%"
                        value={formData.keyAchievementsText}
                        onChange={(e) =>
                          setFormData({ ...formData, keyAchievementsText: e.target.value })
                        }
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">
                        Areas of Growth (Comma separated)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Cross-functional documentation, Mentoring apprentices"
                        value={formData.areasOfImprovementText}
                        onChange={(e) =>
                          setFormData({ ...formData, areasOfImprovementText: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                    Save Performance Review
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

export default PerformancePage;
