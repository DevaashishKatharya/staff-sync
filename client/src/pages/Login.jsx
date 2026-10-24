import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Briefcase,
  UserCheck,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Layers,
  Database,
  CheckCircle2,
} from 'lucide-react';

export const Login = () => {
  const { login, switchRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password');
      return;
    }
    setLoading(true);
    setError('');
    const res = await login(email, password);
    setLoading(false);
    if (!res.success) {
      setError(res.message);
    }
  };

  const handleQuickRole = async (targetRole) => {
    setLoading(true);
    setError('');
    await switchRole(targetRole);
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1040px',
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          gap: '32px',
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg), 0 0 40px rgba(99, 102, 241, 0.15)',
          overflow: 'hidden',
          padding: '40px',
        }}
      >
        {/* Left Side: System Info & Demo Quick Logins */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 6px 18px rgba(99, 102, 241, 0.4)',
                }}
              >
                <Sparkles size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                  Staff<span style={{ color: 'var(--primary-light)' }}>Sync</span>
                </h1>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Enterprise Human Resource Management System
                </div>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '28px', lineHeight: 1.6 }}>
              A centralized, role-based platform designed with MVC architecture for HR administrators, team managers, and employees to streamline personnel records, digital attendance, leaves, announcements, and skill training.
            </p>

            {/* Quick Demo Switcher Title */}
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--primary-light)',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Layers size={14} /> One-Click Instant Role Access
              </div>

              {/* 3 Quick Role Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* HR Card */}
                <div
                  onClick={() => handleQuickRole('hr')}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(168, 85, 247, 0.08)',
                    border: '1px solid rgba(168, 85, 247, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#c084fc')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.25)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        background: 'rgba(168, 85, 247, 0.2)',
                        color: '#c084fc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f3e8ff' }}>
                        HR Director (Sarah Jenkins)
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        Manage employees, approve leaves, monitor attendance, post news
                      </div>
                    </div>
                  </div>
                  <span className="role-badge role-badge-hr">Enter HR</span>
                </div>

                {/* Manager Card */}
                <div
                  onClick={() => handleQuickRole('manager')}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(6, 182, 212, 0.08)',
                    border: '1px solid rgba(6, 182, 212, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#38bdf8')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.25)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        background: 'rgba(6, 182, 212, 0.2)',
                        color: '#38bdf8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Briefcase size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#e0f2fe' }}>
                        Manager (David Miller)
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        Review team leaves, manage training & development
                      </div>
                    </div>
                  </div>
                  <span className="role-badge role-badge-manager">Enter MGR</span>
                </div>

                {/* Employee Card */}
                <div
                  onClick={() => handleQuickRole('employee')}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#34d399')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.25)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: '#34d399',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <UserCheck size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#d1fae5' }}>
                        Employee (Alex Rivera)
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        Clock attendance, apply for leave, track enrolled trainings
                      </div>
                    </div>
                  </div>
                  <span className="role-badge role-badge-employee">Enter EMP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Architecture Tech Stack Badge */}
          <div
            style={{
              paddingTop: '20px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Database size={14} style={{ color: 'var(--success)' }} />
              <span>MongoDB • Express • React • Node.js</span>
            </div>
            <span>MVC Architecture</span>
          </div>
        </div>

        {/* Right Side: Manual Credential Login Form */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '6px' }}>
              Sign In to Your Workspace
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Enter your corporate credentials to access your dashboard
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--danger-bg)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#fb7185',
                fontSize: '0.85rem',
                marginBottom: '18px',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Corporate Email</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="email"
                  className="input-field"
                  style={{ paddingLeft: '38px' }}
                  placeholder="hr@staffsync.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="password"
                  className="input-field"
                  style={{ paddingLeft: '38px' }}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '12px' }}
            >
              {loading ? (
                'Authenticating...'
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: '24px',
              textAlign: 'center',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
            }}
          >
            Demo Passwords for all accounts: <strong style={{ color: 'var(--text-primary)' }}>password123</strong>
            <br />
            Tip: You can also use the 1-click access buttons on the left.
          </div>
        </div>
      </div>
    </div>
  );
};
