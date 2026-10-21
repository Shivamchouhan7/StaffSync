import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { announcementService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  Megaphone,
  Plus,
  Pin,
  Edit,
  Trash2,
  Calendar,
  Users,
  AlertTriangle,
} from 'lucide-react';

const AnnouncementsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const isHR = user?.role === 'hr';

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium',
    targetRole: 'all',
    isPinned: false,
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await announcementService.getAll();
      setAnnouncements(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      content: '',
      priority: 'medium',
      targetRole: 'all',
      isPinned: false,
    });
    setShowModal(true);
  };

  const openEditModal = (a) => {
    setEditingId(a._id);
    setFormData({
      title: a.title,
      content: a.content,
      priority: a.priority,
      targetRole: a.targetRole,
      isPinned: a.isPinned,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await announcementService.update(editingId, formData);
        setFeedback({ type: 'success', message: 'Announcement updated successfully!' });
      } else {
        await announcementService.create(formData);
        setFeedback({ type: 'success', message: 'Announcement published successfully!' });
      }
      setShowModal(false);
      fetchAnnouncements();
    } catch (err) {
      setFeedback({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to save announcement.',
      });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await announcementService.delete(id);
      setFeedback({ type: 'success', message: 'Announcement deleted.' });
      fetchAnnouncements();
    } catch (err) {
      setFeedback({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to delete announcement.',
      });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'badge-soft-danger';
      case 'high':
        return 'badge-soft-warning';
      case 'low':
        return 'badge-soft-secondary';
      default:
        return 'badge-soft-primary';
    }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-1">Company Announcements</h3>
          <p className="text-muted small mb-0">
            Internal organization broadcasts, policy updates, and executive notices
          </p>
        </div>
        {isHR && (
          <button
            className="btn btn-primary d-flex align-items-center gap-1"
            onClick={openCreateModal}
          >
            <Plus size={16} /> New Announcement
          </button>
        )}
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type} py-2 px-3 small rounded-3 mb-4`}>
          {feedback.message}
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading bulletins..." />
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements"
          description="There are currently no active announcements."
        />
      ) : (
        <div className="row g-4">
          {announcements.map((a) => (
            <div key={a._id} className="col-lg-6">
              <div
                className={`saas-card h-100 ${
                  a.isPinned ? 'border-primary' : ''
                }`}
              >
                <div className="saas-card-header">
                  <div className="d-flex align-items-center gap-2">
                    {a.isPinned && (
                      <span className="badge bg-primary text-white d-flex align-items-center gap-1">
                        <Pin size={12} /> Pinned
                      </span>
                    )}
                    <span
                      className={`badge ${getPriorityBadge(a.priority)} text-uppercase`}
                      style={{ fontSize: '0.65rem' }}
                    >
                      {a.priority}
                    </span>
                    <span className="badge badge-soft-secondary text-uppercase" style={{ fontSize: '0.65rem' }}>
                      Audience: {a.targetRole}
                    </span>
                  </div>

                  {isHR && (
                    <div className="btn-group btn-group-sm">
                      <button
                        className="btn btn-link text-secondary p-1"
                        onClick={() => openEditModal(a)}
                        title="Edit"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        className="btn btn-link text-danger p-1"
                        onClick={() => handleDelete(a._id)}
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="saas-card-body">
                  <h5 className="fw-bold text-dark mb-2">{a.title}</h5>
                  <p className="text-secondary small mb-3" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                    {a.content}
                  </p>
                  <div className="d-flex justify-content-between align-items-center text-muted small pt-2 border-top">
                    <span>By {a.authorName}</span>
                    <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">
                  {editingId ? 'Edit Announcement' : 'Publish New Announcement'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Q2 Company All-Hands Schedule"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Priority</label>
                      <select
                        className="form-select"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold">Audience Scope</label>
                      <select
                        className="form-select"
                        value={formData.targetRole}
                        onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                      >
                        <option value="all">All Roles</option>
                        <option value="employee">Employees Only</option>
                        <option value="manager">Managers Only</option>
                        <option value="hr">HR Only</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Content *</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      required
                      placeholder="Write announcement details..."
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    />
                  </div>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="pinCheck"
                      className="form-check-input"
                      checked={formData.isPinned}
                      onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    />
                    <label htmlFor="pinCheck" className="form-check-label small fw-semibold">
                      Pin to top of dashboards
                    </label>
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
                  <button type="submit" className="btn btn-primary">
                    {editingId ? 'Save Changes' : 'Publish Announcement'}
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

export default AnnouncementsPage;
