import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaveService, trainingService } from '../services/api';
import LeaveApplications from '../components/manager/LeaveApplications';
import TrainingManagement from '../components/manager/TrainingManagement';

const emptyTraining = {
  title: '',
  description: '',
  category: 'General',
  trainer: '',
  startDate: '',
  endDate: '',
};

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('leaves');
  const [leaves, setLeaves] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });
  const [feedback, setFeedback] = useState('');
  const [training, setTraining] = useState(emptyTraining);
  const [editingTrainingId, setEditingTrainingId] = useState(null);

  const message = (text) => {
    setFeedback(text);
    window.setTimeout(() => setFeedback(''), 3500);
  };

  const load = async () => {
    try {
      const [leaveResponse, trainingResponse] = await Promise.all([
        leaveService.getTeam(),
        trainingService.getAll(),
      ]);
      setLeaves(leaveResponse.data.data || []);
      setTrainings(trainingResponse.data.data || []);
    } catch (error) {
      message(error.response?.data?.message || 'Unable to load manager data.');
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login', { replace: true });
      return;
    }
    load();
  }, [navigate]);

  const reviewLeave = async (id, status) => {
    try {
      await leaveService.review(id, { status, reviewNotes: 'Decision by Manager' });
      await load();
      message(`Leave ${status}.`);
    } catch (error) {
      message(error.response?.data?.message || 'Unable to review leave.');
    }
  };

  const saveTraining = async (event) => {
    event.preventDefault();
    const isEditing = Boolean(editingTrainingId);
    try {
      if (isEditing) {
        await trainingService.update(editingTrainingId, training);
      } else {
        await trainingService.create(training);
      }
      setTraining(emptyTraining);
      setEditingTrainingId(null);
      await load();
      message(isEditing ? 'Training updated.' : 'Training created.');
    } catch (error) {
      message(error.response?.data?.message || (isEditing ? 'Unable to update training.' : 'Unable to create training.'));
    }
  };

  const editTraining = (item) => {
    setEditingTrainingId(item._id);
    setTraining({
      title: item.title || '',
      description: item.description || '',
      category: item.category || 'General',
      trainer: item.trainer || '',
      startDate: item.startDate ? item.startDate.slice(0, 10) : '',
      endDate: item.endDate ? item.endDate.slice(0, 10) : '',
    });
    setTab('training');
  };

  const cancelTrainingEdit = () => {
    setEditingTrainingId(null);
    setTraining(emptyTraining);
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  return (
    <div className="staff-portal">
      <header className="staff-header">
        <strong>Manager Dashboard</strong>
        <button type="button" onClick={logout}>Logout</button>
      </header>
      <main className="manager-main">
        <section className="manager-card">
          <h1>Welcome Back, {user?.name || 'Manager'}</h1>
          <nav className="manager-tabs">
            <button type="button" className={tab === 'leaves' ? 'active' : ''} onClick={() => setTab('leaves')}>
              Leave Applications
            </button>
            <button type="button" className={tab === 'training' ? 'active' : ''} onClick={() => setTab('training')}>
              Training &amp; Development
            </button>
          </nav>
          {feedback && <p className="staff-feedback" role="status">{feedback}</p>}
          {tab === 'leaves' && <LeaveApplications leaves={leaves} onReview={reviewLeave} />}
          {tab === 'training' && (
            <TrainingManagement
              trainings={trainings}
              value={training}
              editingId={editingTrainingId}
              onChange={setTraining}
              onSubmit={saveTraining}
              onEdit={editTraining}
              onCancel={cancelTrainingEdit}
            />
          )}
        </section>
      </main>
    </div>
  );
};

export default ManagerDashboard;
