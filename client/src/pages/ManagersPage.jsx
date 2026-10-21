import React, { useState, useEffect } from 'react';
import { managerService, employeeService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  UserCheck,
  Users,
  Building,
  UserPlus,
  Trash2,
  CheckCircle,
  X,
  AlertCircle,
} from 'lucide-react';

const ManagersPage = () => {
  const [managers, setManagers] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedManager, setSelectedManager] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mgrRes, empRes] = await Promise.all([
        managerService.getAll(),
        employeeService.getAll({ limit: 100 }),
      ]);
      setManagers(mgrRes.data.data || []);
      setAllEmployees(empRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAssignModal = (manager) => {
    setSelectedManager(manager);
    // Pre-select current team members
    const currentMemberIds = manager.teamMembers?.map((m) => m._id) || [];
    setSelectedEmployees(currentMemberIds);
    setShowAssignModal(true);
  };

  const handleToggleMemberSelection = (userId) => {
    if (selectedEmployees.includes(userId)) {
      setSelectedEmployees(selectedEmployees.filter((id) => id !== userId));
    } else {
      setSelectedEmployees([...selectedEmployees, userId]);
    }
  };

  const handleSaveTeam = async (e) => {
    e.preventDefault();
    try {
      await managerService.assignTeam(selectedManager._id, selectedEmployees);
      setFeedback({ type: 'success', message: 'Team allocation updated successfully!' });
      setShowAssignModal(false);
      fetchData();
    } catch (err) {
      setFeedback({ type: 'danger', message: err.response?.data?.message || 'Failed to update team.' });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleRemoveMember = async (managerId, employeeUserId) => {
    try {
      await managerService.removeTeamMember(managerId, employeeUserId);
      setFeedback({ type: 'success', message: 'Team member removed from manager.' });
      fetchData();
    } catch (err) {
      setFeedback({ type: 'danger', message: err.response?.data?.message || 'Failed to remove team member.' });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-1">Managers & Team Allocation</h3>
          <p className="text-muted small mb-0">
            Define organizational hierarchy, designate leads, and allocate staff to reporting teams
          </p>
        </div>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type} py-2 px-3 small rounded-3 mb-4`}>
          {feedback.message}
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading management rosters..." />
      ) : managers.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No managers registered"
          description="Promote an employee or add a manager from the Employee Directory."
        />
      ) : (
        <div className="row g-4">
          {managers.map((mgr) => (
            <div key={mgr._id} className="col-lg-6">
              <div className="saas-card h-100">
                <div className="saas-card-header bg-light">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold shadow-sm"
                      style={{ width: '42px', height: '42px' }}
                    >
                      {mgr.user?.name ? mgr.user.name.charAt(0).toUpperCase() : 'M'}
                    </div>
                    <div>
                      <h6 className="fw-bold text-dark mb-0">{mgr.user?.name}</h6>
                      <span className="text-muted small">{mgr.user?.email}</span>
                    </div>
                  </div>
                  <span className="badge badge-soft-primary">{mgr.department}</span>
                </div>

                <div className="saas-card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted small fw-semibold text-uppercase">
                      Assigned Team ({mgr.teamMembers?.length || 0})
                    </span>
                    <button
                      className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                      onClick={() => openAssignModal(mgr)}
                    >
                      <UserPlus size={14} /> Assign / Edit Team
                    </button>
                  </div>

                  {mgr.teamMembers?.length === 0 ? (
                    <div className="p-3 text-center text-muted small bg-light rounded-3">
                      No direct reports assigned yet. Click "Assign / Edit Team" to allocate employees.
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {mgr.teamMembers?.map((member) => (
                        <div
                          key={member._id}
                          className="d-flex align-items-center justify-content-between p-2 px-3 border rounded-3 bg-white"
                        >
                          <div className="d-flex align-items-center gap-2">
                            <Users size={16} className="text-primary" />
                            <div>
                              <span className="d-block fw-semibold small text-dark">{member.name}</span>
                              <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                                {member.email}
                              </span>
                            </div>
                          </div>
                          <button
                            className="btn btn-link btn-sm text-danger p-0"
                            onClick={() => handleRemoveMember(mgr._id, member._id)}
                            title="Remove from team"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {mgr.responsibilities?.length > 0 && (
                    <div className="mt-3 pt-3 border-top">
                      <span className="text-muted small d-block mb-1 fw-semibold">Key Responsibilities:</span>
                      <div className="d-flex flex-wrap gap-1">
                        {mgr.responsibilities.map((r, i) => (
                          <span key={i} className="badge bg-light text-secondary border small">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Team Assignment Modal */}
      {showAssignModal && selectedManager && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">
                  Assign Team Members to {selectedManager.user?.name}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAssignModal(false)}
                />
              </div>
              <form onSubmit={handleSaveTeam}>
                <div className="modal-body p-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <p className="text-muted small mb-3">
                    Select the employees that should report to this manager:
                  </p>
                  <div className="d-flex flex-column gap-2">
                    {allEmployees
                      .filter((e) => e.user?._id !== selectedManager.user?._id)
                      .map((emp) => {
                        const isSelected = selectedEmployees.includes(emp.user?._id);
                        return (
                          <div
                            key={emp._id}
                            className={`p-2 px-3 border rounded-3 cursor-pointer d-flex align-items-center justify-content-between ${
                              isSelected ? 'bg-primary-subtle border-primary' : 'bg-light'
                            }`}
                            onClick={() => handleToggleMemberSelection(emp.user?._id)}
                          >
                            <div>
                              <span className="d-block fw-semibold small text-dark">
                                {emp.user?.name}
                              </span>
                              <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                                {emp.department} • {emp.designation}
                              </span>
                            </div>
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={isSelected}
                              onChange={() => {}}
                            />
                          </div>
                        );
                      })}
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowAssignModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Team Assignment
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

export default ManagersPage;
