import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { employeeService, managerService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit,
  Power,
  Eye,
  Mail,
  Phone,
  Building,
  CheckCircle,
  XCircle,
  Plus,
} from 'lucide-react';

const EmployeesPage = () => {
  const { user } = useSelector((state) => state.auth);
  const isHR = user?.role === 'hr';

  const [employees, setEmployees] = useState([]);
  const [managersList, setManagersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [feedback, setFeedback] = useState(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: 'Engineering',
    designation: '',
    salary: 0,
    manager: '',
    phone: '',
    address: { street: '', city: '', state: '', zipCode: '', country: 'USA' },
  });

  const fetchEmployees = async (page = 1) => {
    setLoading(true);
    try {
      if (isHR) {
        const res = await employeeService.getAll({
          page,
          limit: pagination.limit,
          search: searchTerm,
          department: selectedDept,
          status: selectedStatus,
        });
        setEmployees(res.data.data || []);
        setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, pages: 1 });
      } else {
        // Manager viewing their team
        const res = await managerService.getMyTeam();
        setEmployees(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    if (isHR) {
      try {
        const res = await managerService.getAll();
        setManagersList(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchEmployees(1);
    fetchManagers();
  }, [selectedDept, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEmployees(1);
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await employeeService.toggleStatus(id);
      setFeedback({ type: 'success', message: res.data.message });
      fetchEmployees(pagination.page);
    } catch (err) {
      setFeedback({ type: 'danger', message: err.response?.data?.message || 'Failed to toggle status.' });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await employeeService.create(formData);
      setFeedback({ type: 'success', message: 'Employee added successfully!' });
      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        department: 'Engineering',
        designation: '',
        salary: 0,
        manager: '',
        phone: '',
        address: { street: '', city: '', state: '', zipCode: '', country: 'USA' },
      });
      fetchEmployees(1);
    } catch (err) {
      setFeedback({ type: 'danger', message: err.response?.data?.message || 'Failed to create employee.' });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const openEditModal = (emp) => {
    setSelectedEmployee(emp);
    setFormData({
      name: emp.user?.name || '',
      department: emp.department || 'Engineering',
      designation: emp.designation || '',
      salary: emp.salary || 0,
      manager: emp.manager?._id || '',
      phone: emp.phone || '',
      status: emp.status || 'active',
      role: emp.user?.role || 'employee',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await employeeService.update(selectedEmployee._id, formData);
      setFeedback({ type: 'success', message: 'Employee updated successfully!' });
      setShowEditModal(false);
      setSelectedEmployee(null);
      fetchEmployees(pagination.page);
    } catch (err) {
      setFeedback({ type: 'danger', message: err.response?.data?.message || 'Failed to update employee.' });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-1">
            {isHR ? 'Employee Directory' : 'My Assigned Team Members'}
          </h3>
          <p className="text-muted small mb-0">
            {isHR
              ? 'Manage organization personnel, department assignments, and job roles'
              : 'Direct reports assigned under your supervisory scope'}
          </p>
        </div>
        {isHR && (
          <button
            className="btn btn-primary d-flex align-items-center gap-1"
            onClick={() => setShowAddModal(true)}
          >
            <UserPlus size={16} /> Add New Employee
          </button>
        )}
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type} py-2 px-3 small rounded-3 mb-4`}>
          {feedback.message}
        </div>
      )}

      {/* Filter and Search Bar (HR Only) */}
      {isHR && (
        <div className="saas-card mb-4 p-3">
          <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search by name, ID, or designation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-3">
              <select
                className="form-select"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
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

            <div className="col-md-2">
              <select
                className="form-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="col-md-2 d-flex gap-2">
              <button type="submit" className="btn btn-outline-primary w-100">
                Filter
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Employee Table */}
      <div className="saas-card">
        <div className="table-responsive">
          {loading ? (
            <LoadingSpinner message="Loading employee directory..." />
          ) : employees.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No employees found"
              description="No matching staff records found for the applied filters."
            />
          ) : (
            <table className="table table-saas">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>ID</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Role</th>
                  <th>Reporting Manager</th>
                  {isHR && <th>Salary</th>}
                  <th>Status</th>
                  {isHR && <th className="text-end">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle bg-light d-flex align-items-center justify-content-center fw-bold text-primary border"
                          style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}
                        >
                          {emp.user?.name ? emp.user.name.charAt(0).toUpperCase() : 'E'}
                        </div>
                        <div>
                          <span className="fw-bold text-dark d-block">{emp.user?.name}</span>
                          <span className="text-muted small">{emp.user?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-soft-secondary font-monospace">
                        {emp.employeeId}
                      </span>
                    </td>
                    <td className="small text-dark fw-medium">{emp.department}</td>
                    <td className="small text-muted">{emp.designation}</td>
                    <td>
                      <span
                        className={`badge ${
                          emp.user?.role === 'hr'
                            ? 'badge-soft-danger'
                            : emp.user?.role === 'manager'
                            ? 'badge-soft-primary'
                            : 'badge-soft-info'
                        } text-capitalize`}
                      >
                        {emp.user?.role}
                      </span>
                    </td>
                    <td className="small text-muted">
                      {emp.manager?.name || '—'}
                    </td>
                    {isHR && (
                      <td className="small font-monospace fw-semibold">
                        ${emp.salary?.toLocaleString() || 0}
                      </td>
                    )}
                    <td>
                      <span
                        className={`badge ${
                          emp.status === 'active' ? 'badge-soft-success' : 'badge-soft-danger'
                        } text-capitalize`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    {isHR && (
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => openEditModal(emp)}
                            title="Edit Employee"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className={`btn ${
                              emp.status === 'active' ? 'btn-outline-danger' : 'btn-outline-success'
                            }`}
                            onClick={() => handleToggleStatus(emp._id)}
                            title={emp.status === 'active' ? 'Deactivate' : 'Activate'}
                          >
                            <Power size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {isHR && pagination.pages > 1 && (
          <div className="p-3 border-top d-flex justify-content-between align-items-center">
            <span className="text-muted small">
              Page {pagination.page} of {pagination.pages} ({pagination.total} Total)
            </span>
            <div className="btn-group btn-group-sm">
              <button
                className="btn btn-outline-secondary"
                disabled={pagination.page <= 1}
                onClick={() => fetchEmployees(pagination.page - 1)}
              >
                Previous
              </button>
              <button
                className="btn btn-outline-secondary"
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchEmployees(pagination.page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Add New Employee</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                />
              </div>
              <form onSubmit={handleAddSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Full Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Email Address *</label>
                      <input
                        type="email"
                        className="form-control"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Initial Password *</label>
                      <input
                        type="password"
                        className="form-control"
                        required
                        minLength={6}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">System Role *</label>
                      <select
                        className="form-select"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="hr">HR Administrator</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Department *</label>
                      <select
                        className="form-select"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Product & Design">Product & Design</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Sales">Sales</option>
                        <option value="Finance">Finance</option>
                        <option value="Operations">Operations</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Job Title / Designation *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="e.g. Lead Engineer"
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Annual Salary ($) *</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Reporting Manager</label>
                      <select
                        className="form-select"
                        value={formData.manager}
                        onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                      >
                        <option value="">None / Unassigned</option>
                        {managersList.map((m) => (
                          <option key={m.user?._id} value={m.user?._id}>
                            {m.user?.name} ({m.department})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Phone Number</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Employee
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Edit Employee: {selectedEmployee.user?.name}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                />
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Department</label>
                      <select
                        className="form-select"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Product & Design">Product & Design</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Sales">Sales</option>
                        <option value="Finance">Finance</option>
                        <option value="Operations">Operations</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Designation</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Annual Salary ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Reporting Manager</label>
                      <select
                        className="form-select"
                        value={formData.manager}
                        onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                      >
                        <option value="">None / Unassigned</option>
                        {managersList.map((m) => (
                          <option key={m.user?._id} value={m.user?._id}>
                            {m.user?.name} ({m.department})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="on_leave">On Leave</option>
                        <option value="terminated">Terminated</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
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

export default EmployeesPage;
