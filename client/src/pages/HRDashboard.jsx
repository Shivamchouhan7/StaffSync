import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  announcementService,
  attendanceService,
  employeeService,
  leaveService,
  managerService,
} from '../services/api';
import AnnouncementsManager from '../components/hr/AnnouncementsManager';
import AttendanceSummary from '../components/hr/AttendanceSummary';
import EmployeeCRUD from '../components/hr/EmployeeCRUD';
import LeaveApplications from '../components/hr/LeaveApplications';

const HrDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('employees');
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [managers, setManagers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState('');
  const [announcementLoading, setAnnouncementLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [employee, setEmployee] = useState({
    name: '',
    email: '',
    department: '',
    designation: '',
    salary: '',
    joiningDate: '',
    phone: '',
    address: '',
  });
  const [announcement, setAnnouncement] = useState({
    title: '',
    content: '',
    priority: 'medium',
    targetRole: 'all',
    isPinned: false,
  });

  const message = (text) => {
    setFeedback(text);
    window.setTimeout(() => setFeedback(''), 3500);
  };

  const load = async () => {
    try {
      const [
        employeesResponse,
        leavesResponse,
        attendanceResponse,
        managersResponse,
        announcementsResponse,
      ] =
        await Promise.all([
          employeeService.getAll({ limit: 100 }),
          leaveService.getAll(),
          attendanceService.getAll(),
          managerService.getAll(),
          announcementService.getAll(),
        ]);
      setEmployees(employeesResponse.data.data || []);
      setLeaves(leavesResponse.data.data || []);
      setAttendance(attendanceResponse.data.data || []);
      setManagers(managersResponse.data.data || []);
      setAnnouncements(announcementsResponse.data.data || []);
    } catch (error) {
      message(error.response?.data?.message || 'Unable to load HR data.');
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login', { replace: true });
      return;
    }
    load();
  }, [navigate]);

  const logout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  const addEmployee = async (event) => {
    event.preventDefault();
    try {
      await employeeService.create({
        ...employee,
        password: 'Password@123',
        role: 'employee',
        address: { street: employee.address },
      });
      setEmployee({
        name: '',
        email: '',
        department: '',
        designation: '',
        salary: '',
        joiningDate: '',
        phone: '',
        address: '',
      });
      await load();
      message('Employee added successfully.');
    } catch (error) {
      message(error.response?.data?.message || 'Unable to add employee.');
    }
  };

  const reviewLeave = async (id, status) => {
    try {
      await leaveService.review(id, { status, reviewNotes: 'Decision by HR' });
      await load();
      message(`Leave ${status}.`);
    } catch (error) {
      message(error.response?.data?.message || 'Unable to review leave.');
    }
  };

  const createAnnouncement = async (event) => {
    event.preventDefault();
    setAnnouncementLoading(true);
    try {
      if (editingAnnouncementId) {
        await announcementService.update(editingAnnouncementId, announcement);
        message('Announcement updated.');
      } else {
        await announcementService.create(announcement);
        message('Announcement created.');
      }
      setAnnouncement({
        title: '',
        content: '',
        priority: 'medium',
        targetRole: 'all',
        isPinned: false,
      });
      setEditingAnnouncementId('');
      await load();
    } catch (error) {
      message(error.response?.data?.message || 'Unable to save announcement.');
    } finally {
      setAnnouncementLoading(false);
    }
  };

  const editAnnouncement = (item) => {
    setEditingAnnouncementId(item._id);
    setAnnouncement({
      title: item.title || '',
      content: item.content || '',
      priority: item.priority || 'medium',
      targetRole: item.targetRole || 'all',
      isPinned: Boolean(item.isPinned),
    });
  };

  const cancelAnnouncementEdit = () => {
    setEditingAnnouncementId('');
    setAnnouncement({
      title: '',
      content: '',
      priority: 'medium',
      targetRole: 'all',
      isPinned: false,
    });
  };

  const deleteAnnouncement = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await announcementService.remove(id);
      if (editingAnnouncementId === id) cancelAnnouncementEdit();
      await load();
      message('Announcement deleted.');
    } catch (error) {
      message(error.response?.data?.message || 'Unable to delete announcement.');
    }
  };

  const toggleEmployeeStatus = async (item) => {
    const action = item.user?.isActive === false ? 'activate' : 'deactivate';
    try {
      const response = await employeeService.toggleStatus(item._id);
      await load();
      message(response.data.message || `Employee account ${action}d successfully.`);
    } catch (error) {
      message(error.response?.data?.message || `Unable to ${action} employee account.`);
    }
  };

  const assignManager = async (employeeItem, managerId) => {
    if (!managerId || !employeeItem.user?._id) return;
    try {
      const manager = managers.find((item) => item._id === managerId);
      await managerService.assignTeam(managerId, [employeeItem.user._id]);
      await load();
      message(`${employeeItem.user.name} assigned to ${manager?.user?.name || 'manager'}.`);
    } catch (error) {
      message(error.response?.data?.message || 'Unable to assign manager.');
    }
  };

  return (
    <div className="staff-portal">
      <header className="staff-header">
        <strong>HR Portal</strong>
        <button type="button" onClick={logout}>Logout</button>
      </header>
      <main className="staff-main">
        <h1>HR Dashboard</h1>
        <nav className="staff-tabs">
          {[
            ['leaves', 'Leave Applications'],
            ['employees', 'Employee Management'],
            ['announcements', 'Announcements'],
            ['attendance', 'Attendance'],
          ].map(([key, label]) => (
            <button
              type="button"
              className={tab === key ? 'active' : ''}
              onClick={() => setTab(key)}
              key={key}
            >
              {label}
            </button>
          ))}
        </nav>
        {feedback && <p className="staff-feedback" role="status">{feedback}</p>}
        {tab === 'employees' && (
          <EmployeeCRUD
            value={employee}
            employees={employees}
            managers={managers}
            onChange={setEmployee}
            onSubmit={addEmployee}
            onToggleStatus={toggleEmployeeStatus}
            onAssignManager={assignManager}
          />
        )}
        {tab === 'leaves' && <LeaveApplications leaves={leaves} onReview={reviewLeave} />}
        {tab === 'announcements' && (
          <AnnouncementsManager
            value={announcement}
            announcements={announcements}
            editingId={editingAnnouncementId}
            onChange={setAnnouncement}
            onSubmit={createAnnouncement}
            onEdit={editAnnouncement}
            onDelete={deleteAnnouncement}
            onCancel={cancelAnnouncementEdit}
            loading={announcementLoading}
          />
        )}
        {tab === 'attendance' && <AttendanceSummary attendance={attendance} />}
      </main>
    </div>
  );
};

export default HrDashboard;
