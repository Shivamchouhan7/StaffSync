import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  announcementService,
  attendanceService,
  authService,
  leaveService,
  trainingService,
} from '../services/api';
import Announcements from '../components/employee/Announcements';
import Attendance from '../components/employee/Attendance';
import LeaveApply from '../components/employee/LeaveApply';
import LeaveList from '../components/employee/LeaveList';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('announcements');
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });
  const [profile, setProfile] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [leaveForm, setLeaveForm] = useState({ startDate: '', endDate: '', reason: '' });
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const showFeedback = (message) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(''), 3500);
  };

  const loadProfile = async () => {
    const response = await authService.getMe();
    setUser(response.data.user);
    setProfile(response.data.profile);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  };

  const loadPortalData = async () => {
    const [announcementResponse, trainingResponse, leaveResponse, attendanceResponse] =
      await Promise.all([
        announcementService.getAll(),
        trainingService.getAll(),
        leaveService.getMyLeaves(),
        attendanceService.getMyAttendance(),
      ]);
    setAnnouncements(announcementResponse.data.data || []);
    setTrainings(trainingResponse.data.data || []);
    setLeaves(leaveResponse.data.data || []);
    setAttendance(attendanceResponse.data.data || []);
    setTodayAttendance(attendanceResponse.data.today || null);
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login', { replace: true });
      return;
    }

    Promise.all([loadProfile(), loadPortalData()]).catch((error) => {
      showFeedback(error.response?.data?.message || 'Unable to load your portal data.');
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const handleLeaveSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await leaveService.apply({ ...leaveForm, leaveType: 'annual' });
      setLeaveForm({ startDate: '', endDate: '', reason: '' });
      setLeaves((await leaveService.getMyLeaves()).data.data || []);
      showFeedback('Leave application submitted successfully.');
    } catch (error) {
      showFeedback(error.response?.data?.message || 'Unable to apply for leave.');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendance = async (action) => {
    setLoading(true);
    try {
      const response =
        action === 'checkIn'
          ? await attendanceService.checkIn()
          : await attendanceService.checkOut();
      const attendanceResponse = await attendanceService.getMyAttendance();
      setAttendance(attendanceResponse.data.data || []);
      setTodayAttendance(attendanceResponse.data.today || null);
      showFeedback(response.data.message);
    } catch (error) {
      showFeedback(error.response?.data?.message || 'Unable to update attendance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-portal">
      <header className="employee-header">
        <strong>Employee Portal</strong>
        <button type="button" onClick={handleLogout}>Logout</button>
      </header>
      <main className="employee-content">
        <nav className="employee-tabs" aria-label="Employee portal">
          {[
            ['announcements', 'Announcements'],
            ['leaves', 'Leaves'],
            ['attendance', 'Attendance'],
            ['profile', 'Profile'],
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
        {feedback && <p className="employee-feedback" role="status">{feedback}</p>}
        {tab === 'announcements' && (
          <Announcements announcements={announcements} trainings={trainings} />
        )}
        {tab === 'leaves' && (
          <div className="employee-stack">
            <LeaveApply
              value={leaveForm}
              loading={loading}
              onChange={setLeaveForm}
              onSubmit={handleLeaveSubmit}
            />
            <LeaveList leaves={leaves} />
          </div>
        )}
        {tab === 'attendance' && (
          <Attendance
            records={attendance}
            today={todayAttendance}
            loading={loading}
            onAttendance={handleAttendance}
          />
        )}
        {tab === 'profile' && (
          <section className="employee-panel employee-profile">
            <h2>My Profile</h2>
            <p><span>Name:</span> {user?.name || '—'}</p>
            <p><span>Email:</span> {user?.email || '—'}</p>
            <p><span>Role:</span> {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '—'}</p>
            {profile?.department && <p><span>Department:</span> {profile.department}</p>}
            {profile?.designation && <p><span>Designation:</span> {profile.designation}</p>}
          </section>
        )}
      </main>
    </div>
  );
};

export default EmployeeDashboard;
