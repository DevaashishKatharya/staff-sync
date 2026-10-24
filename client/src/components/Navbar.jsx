import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Briefcase,
  UserCheck,
  LogOut,
  Bell,
  Sparkles,
} from 'lucide-react';

export const Navbar = () => {
  const { user, role, employee, logout, switchRole } = useAuth();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: '70px',
        background: 'rgba(11, 15, 23, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
      }}
    >
      {/* Brand & Active Role Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em' }}>
              Staff<span style={{ color: 'var(--primary-light)' }}>Sync</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1 }}>
              Enterprise HRM System
            </div>
          </div>
        </div>

        {/* Current Active Role Indicator */}
        <div style={{ marginLeft: '12px' }}>
          {role === 'hr' && (
            <span className="role-badge role-badge-hr">
              <ShieldCheck size={12} style={{ display: 'inline', marginRight: '4px' }} />
              HR Portal
            </span>
          )}
          {role === 'manager' && (
            <span className="role-badge role-badge-manager">
              <Briefcase size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Manager View
            </span>
          )}
          {role === 'employee' && (
            <span className="role-badge role-badge-employee">
              <UserCheck size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Employee Hub
            </span>
          )}
        </div>
      </div>

      {/* Role Switcher Toolbar (Demo Mode Helper) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '4px 8px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <span
          style={{
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            fontWeight: 600,
            textTransform: 'uppercase',
            padding: '0 6px',
          }}
        >
          Quick Switch:
        </span>
        <button
          className={`btn btn-sm ${role === 'hr' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => switchRole('hr')}
          title="Switch to HR (Sarah Jenkins)"
          style={{ fontSize: '0.75rem', padding: '4px 10px' }}
        >
          <ShieldCheck size={13} /> HR
        </button>
        <button
          className={`btn btn-sm ${role === 'manager' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => switchRole('manager')}
          title="Switch to Manager (David Miller)"
          style={{ fontSize: '0.75rem', padding: '4px 10px' }}
        >
          <Briefcase size={13} /> Manager
        </button>
        <button
          className={`btn btn-sm ${role === 'employee' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => switchRole('employee')}
          title="Switch to Employee (Alex Rivera)"
          style={{ fontSize: '0.75rem', padding: '4px 10px' }}
        >
          <UserCheck size={13} /> Employee
        </button>
      </div>

      {/* User profile & actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              border: '2px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
            }}
          >
            {employee ? `${employee.firstName[0]}${employee.lastName[0]}` : 'U'}
          </div>
          <div style={{ display: 'none', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>
              {employee ? employee.fullName : user?.email}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {employee?.designation || role?.toUpperCase()}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn btn-outline btn-sm"
          style={{ gap: '6px', padding: '6px 12px' }}
          title="Log out"
        >
          <LogOut size={14} />
          <span>Exit</span>
        </button>
      </div>
    </header>
  );
};
