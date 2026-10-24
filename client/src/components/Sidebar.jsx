import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Clock,
  GraduationCap,
  Megaphone,
  User,
  Shield,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { role, employee } = useAuth();

  const getNavItems = () => {
    switch (role) {
      case 'hr':
        return [
          { id: 'dashboard', label: 'HR Dashboard', icon: LayoutDashboard },
          { id: 'employees', label: 'Employees Directory', icon: Users, badge: 'All' },
          { id: 'leaves', label: 'Leave Requests', icon: CalendarCheck, badge: 'Review' },
          { id: 'attendance', label: 'Daily Attendance', icon: Clock },
          { id: 'training', label: 'Training & Dev', icon: GraduationCap },
          { id: 'announcements', label: 'Announcements', icon: Megaphone },
          { id: 'profile', label: 'My Profile', icon: User },
        ];
      case 'manager':
        return [
          { id: 'dashboard', label: 'Manager Dashboard', icon: LayoutDashboard },
          { id: 'leaves', label: 'Team Leaves', icon: CalendarCheck, badge: 'Pending' },
          { id: 'training', label: 'Training Programs', icon: GraduationCap },
          { id: 'attendance', label: 'Team Attendance', icon: Clock },
          { id: 'announcements', label: 'Announcements', icon: Megaphone },
          { id: 'profile', label: 'My Profile', icon: User },
        ];
      case 'employee':
      default:
        return [
          { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
          { id: 'leaves', label: 'Apply Leave & History', icon: CalendarCheck },
          { id: 'attendance', label: 'Attendance & Clock', icon: Clock },
          { id: 'training', label: 'My Training', icon: GraduationCap },
          { id: 'announcements', label: 'Announcements', icon: Megaphone },
          { id: 'profile', label: 'My Records & Profile', icon: User },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: '270px',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 40,
        padding: '24px 16px',
      }}
    >
      {/* Brand logo top section */}
      <div
        style={{
          padding: '4px 12px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.2rem',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
          }}
        >
          S
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
            Staff<span style={{ color: 'var(--primary-light)' }}>Sync</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            HRM System v1.0
          </div>
        </div>
      </div>

      {/* Role Context Card */}
      <div
        style={{
          margin: '20px 0 16px',
          padding: '12px 14px',
          background: 'rgba(255, 255, 255, 0.025)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background:
              role === 'hr'
                ? 'rgba(168, 85, 247, 0.15)'
                : role === 'manager'
                ? 'rgba(6, 182, 212, 0.15)'
                : 'rgba(16, 185, 129, 0.15)',
            color:
              role === 'hr'
                ? '#c084fc'
                : role === 'manager'
                ? '#38bdf8'
                : '#34d399',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Shield size={16} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color:
                role === 'hr'
                  ? '#c084fc'
                  : role === 'manager'
                  ? '#38bdf8'
                  : '#34d399',
            }}
          >
            {role === 'hr' ? 'HR Personnel' : role === 'manager' ? 'Team Manager' : 'Staff Employee'}
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {employee ? employee.fullName : 'Authorized User'}
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-muted)',
            padding: '8px 12px 4px',
          }}
        >
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: isActive
                  ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.18) 0%, rgba(99, 102, 241, 0.05) 100%)'
                  : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: isActive
                  ? '1px solid rgba(99, 102, 241, 0.35)'
                  : '1px solid transparent',
                fontSize: '0.88rem',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <Icon
                size={18}
                style={{
                  color: isActive ? 'var(--primary-light)' : 'var(--text-muted)',
                  transition: 'color var(--transition-fast)',
                }}
              />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {item.badge}
                </span>
              )}
              {isActive && (
                <ChevronRight size={14} style={{ color: 'var(--primary-light)' }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Footer info */}
      <div
        style={{
          paddingTop: '16px',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--success)',
              boxShadow: '0 0 8px var(--success)',
            }}
          />
          <span>MongoDB API Connected</span>
        </div>
        <div style={{ fontSize: '0.7rem' }}>StaffSync • MVC Architecture</div>
      </div>
    </aside>
  );
};
