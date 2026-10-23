import { BrowserRouter } from 'react-router-dom';
import { Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import EmployeeDashboard from './pages/EmployeeDashboard';
import HrDashboard from './pages/HrDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import ProtectedRoute from './routes/ProtectedRoute';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/employee-portal" element={<ProtectedRoute roles={['employee']}><EmployeeDashboard /></ProtectedRoute>} />
      <Route path="/hr-portal" element={<ProtectedRoute roles={['hr']}><HrDashboard /></ProtectedRoute>} />
      <Route path="/manager-portal" element={<ProtectedRoute roles={['manager']}><ManagerDashboard /></ProtectedRoute>} />
      <Route path="*" element={<Home />} />
    </Routes>
  </BrowserRouter>
);

export default App;