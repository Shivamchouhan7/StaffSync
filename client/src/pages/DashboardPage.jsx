import React from 'react';
import { useSelector } from 'react-redux';
import HRDashboard from './HRDashboard';
import ManagerDashboard from './ManagerDashboard';
import EmployeeDashboard from './EmployeeDashboard';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return null;

  switch (user.role) {
    case 'hr':
      return <HRDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'employee':
    default:
      return <EmployeeDashboard />;
  }
};

export default DashboardPage;
