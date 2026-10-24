import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { NotificationToast } from './components/NotificationToast';
import { Login } from './pages/Login';

// Pages
import { HRDashboard } from './pages/HRDashboard';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { EmployeesManagement } from './pages/EmployeesManagement';
import { LeaveManagement } from './pages/LeaveManagement';
import { AttendanceTracker } from './pages/AttendanceTracker';
import { TrainingPage } from './pages/TrainingPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { ProfilePage } from './pages/ProfilePage';

export function App() {
  const { isAuthenticated, loading, role } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-base)',
          color: 'var(--text-secondary)',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '3px solid rgba(99, 102, 241, 0.2)',
            borderTopColor: 'var(--primary)',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div>Initializing StaffSync HRM Portal...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Login />
        <NotificationToast />
      </>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        if (role === 'hr') return <HRDashboard setActiveTab={setActiveTab} />;
        if (role === 'manager') return <ManagerDashboard setActiveTab={setActiveTab} />;
        return <EmployeeDashboard setActiveTab={setActiveTab} />;
      case 'employees':
        return <EmployeesManagement />;
      case 'leaves':
        return <LeaveManagement />;
      case 'attendance':
        return <AttendanceTracker />;
      case 'training':
        return <TrainingPage />;
      case 'announcements':
        return <AnnouncementsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HRDashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        <Navbar />
        <main>{renderContent()}</main>
      </div>
      <NotificationToast />
    </div>
  );
}

export default App;
