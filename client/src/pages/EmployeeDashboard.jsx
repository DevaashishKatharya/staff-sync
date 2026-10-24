import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { Modal } from '../components/Modal';
import {
  Clock,
  CalendarCheck,
  GraduationCap,
  Megaphone,
  UserCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  FileText,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export const EmployeeDashboard = ({ setActiveTab }) => {
  const { employee, showToast } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Digital punch clock state
  const [punchLocation, setPunchLocation] = useState('Office');
  const [punching, setPunching] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Apply Leave Modal state
  const [applyLeaveModalOpen, setApplyLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'Casual Leave',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [submittingLeave, setSubmittingLeave] = useState(false);

  // Live clock interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.reports.getEmployeeMetrics();
      if (res.success) {
        setMetrics(res.metrics);
        setTodayAttendance(res.todayAttendance);
        setRecentLeaves(res.recentLeaves || []);
        setTrainings(res.trainings || []);
        setAnnouncements(res.announcements || []);
      }
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle punch in/out
  const handlePunch = async (action) => {
    try {
      setPunching(true);
      const res = await api.attendance.punch({
        action,
        location: punchLocation,
        notes: `Self digital punch via Employee Portal`,
      });
      if (res.success) {
        showToast(res.message, 'success');
        setTodayAttendance(res.attendance);
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'warning');
    } finally {
      setPunching(false);
    }
  };

  // Submit leave application
  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) {
      showToast('Please provide dates and reason.', 'warning');
      return;
    }

    try {
      setSubmittingLeave(true);
      const res = await api.leaves.apply(leaveForm);
      if (res.success) {
        showToast('Leave application submitted to Manager & HR.', 'success');
        setApplyLeaveModalOpen(false);
        setLeaveForm({
          leaveType: 'Casual Leave',
          startDate: '',
          endDate: '',
          reason: '',
        });
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setSubmittingLeave(false);
    }
  };

  // Quick update training progress
  const handleUpdateProgress = async (trainingId, currentProgress) => {
    const nextProgress = Math.min(100, currentProgress + 25);
    try {
      const res = await api.training.updateProgress(trainingId, {
        progress: nextProgress,
      });
      if (res.success) {
        showToast(`Training progress updated to ${nextProgress}%!`, 'success');
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading Personal Workspace & Attendance...</div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">
            <UserCheck size={28} style={{ color: '#34d399' }} />
            <span>Employee Hub & Workspace</span>
          </div>
          <div className="page-subtitle">
            Welcome back, {employee?.fullName || 'Employee'} • {employee?.designation} ({employee?.department})
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-primary"
            onClick={() => setApplyLeaveModalOpen(true)}
          >
            <Calendar size={16} />
            <span>Apply For Leave</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Stats */}
      <div className="stats-grid">
        <StatCard
          title="Leave Balance Remaining"
          value={`${metrics?.remainingLeaveBalance || 0} Days`}
          icon={CalendarCheck}
          color="success"
          badge={`${metrics?.totalLeavesTaken || 0} Used`}
          subtext="Annual allowance of 24 days"
          onClick={() => setActiveTab('leaves')}
        />
        <StatCard
          title="Enrolled Training Programs"
          value={metrics?.enrolledTrainingsCount || 0}
          icon={GraduationCap}
          color="purple"
          badge={`${metrics?.completedTrainingsCount || 0} Completed`}
          subtext="Skill development courses"
          onClick={() => setActiveTab('training')}
        />
        <StatCard
          title="Pending Leave Applications"
          value={metrics?.pendingLeavesCount || 0}
          icon={Clock}
          color="warning"
          subtext="Awaiting manager review"
          onClick={() => setActiveTab('leaves')}
        />
        <StatCard
          title="Attendance Today"
          value={todayAttendance?.checkIn ? (todayAttendance.checkOut ? 'Completed' : 'Checked In') : 'Not Checked In'}
          icon={UserCheck}
          color={todayAttendance?.checkIn ? 'secondary' : 'primary'}
          badge={todayAttendance?.status || 'Pending'}
          subtext={todayAttendance?.checkIn ? `Since ${new Date(todayAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Clock in below'}
          onClick={() => setActiveTab('attendance')}
        />
      </div>

      {/* Grid: Attendance Digital Punch Clock + Leave Summary */}
      <div className="two-col-grid" style={{ marginBottom: '28px' }}>
        {/* Attendance Digital Punch Card */}
        <div className="punch-card">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} style={{ color: 'var(--primary-light)' }} />
                <h3 style={{ fontSize: '1.15rem' }}>Digital Attendance Clock</h3>
              </div>
              <span className="badge badge-purple">
                <MapPin size={12} /> {punchLocation}
              </span>
            </div>

            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: 'var(--text-primary)',
                }}
              >
                {currentTime}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            {/* Attendance Status Details */}
            {todayAttendance?.checkIn && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '18px',
                  display: 'flex',
                  justifyContent: 'space-around',
                  fontSize: '0.85rem',
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Punch In: </span>
                  <strong style={{ color: 'var(--success)' }}>
                    {new Date(todayAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Status: </span>
                  <span className={`badge ${todayAttendance.status === 'Present' ? 'badge-success' : 'badge-warning'}`}>
                    {todayAttendance.status}
                  </span>
                </div>
                {todayAttendance.checkOut && (
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Punch Out: </span>
                    <strong style={{ color: '#38bdf8' }}>
                      {new Date(todayAttendance.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </strong>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            {/* Punch Location Selector */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              {['Office', 'Remote', 'Hybrid'].map((loc) => (
                <button
                  key={loc}
                  className={`btn btn-sm ${punchLocation === loc ? 'btn-secondary' : 'btn-outline'}`}
                  style={{ flex: 1, borderColor: punchLocation === loc ? 'var(--primary-light)' : undefined }}
                  onClick={() => setPunchLocation(loc)}
                  disabled={todayAttendance?.checkOut}
                >
                  {loc}
                </button>
              ))}
            </div>

            {/* Punch Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                className="btn btn-success"
                onClick={() => handlePunch('check-in')}
                disabled={punching || !!todayAttendance?.checkIn}
                style={{ padding: '12px' }}
              >
                <CheckCircle2 size={16} />
                <span>{todayAttendance?.checkIn ? 'Punched In' : 'Clock In'}</span>
              </button>

              <button
                className="btn btn-danger"
                onClick={() => handlePunch('check-out')}
                disabled={punching || !todayAttendance?.checkIn || !!todayAttendance?.checkOut}
                style={{ padding: '12px' }}
              >
                <Clock size={16} />
                <span>{todayAttendance?.checkOut ? 'Punched Out' : 'Clock Out'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* My Enrolled Training Programs */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>My Enrolled Training</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Professional skill development assigned by management
              </p>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setActiveTab('training')}
            >
              <span>Explore All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {trainings.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>
                No active training courses assigned yet.
              </div>
            ) : (
              trainings.map((t) => (
                <div
                  key={t._id}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.025)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.title}</div>
                    <span className="badge badge-purple">{t.myProgress}%</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    Instructor: {t.instructor} • Duration: {t.duration}
                  </div>

                  <div className="progress-bar-bg" style={{ marginBottom: '10px' }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${t.myProgress}%`,
                        background: t.myProgress === 100 ? 'var(--success)' : 'var(--primary)',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {t.myProgress < 100 ? (
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                        onClick={() => handleUpdateProgress(t._id, t.myProgress)}
                      >
                        <TrendingUp size={12} /> Log +25% Progress
                      </button>
                    ) : (
                      <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                        <CheckCircle2 size={12} /> Completed
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Leave Requests & Personal Records Section */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>My Leave Application History</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Track approval status and reviewer comments
            </p>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setActiveTab('leaves')}
          >
            <span>Leave Details</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {recentLeaves.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No recent leave applications.
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Manager / HR Remarks</th>
                </tr>
              </thead>
              <tbody>
                {recentLeaves.map((l) => (
                  <tr key={l._id}>
                    <td style={{ fontWeight: 600 }}>{l.leaveType}</td>
                    <td>{new Date(l.startDate).toLocaleDateString()}</td>
                    <td>{new Date(l.endDate).toLocaleDateString()}</td>
                    <td>{l.daysCount} days</td>
                    <td>
                      <span
                        className={`badge ${
                          l.status === 'Approved'
                            ? 'badge-success'
                            : l.status === 'Rejected'
                            ? 'badge-danger'
                            : 'badge-warning'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {l.reviewerComments || 'Pending review'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Announcements Feed */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>Company Announcements</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Latest news and policy updates from Leadership and HR
            </p>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setActiveTab('announcements')}
          >
            <span>All Announcements</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="three-col-grid">
          {announcements.map((ann) => (
            <div
              key={ann._id}
              className="glass-card"
              style={{
                borderLeft: ann.isPinned ? '4px solid var(--primary)' : '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span
                  className={`badge ${
                    ann.priority === 'Urgent'
                      ? 'badge-danger'
                      : ann.priority === 'High'
                      ? 'badge-warning'
                      : 'badge-info'
                  }`}
                >
                  {ann.priority}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {new Date(ann.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '6px' }}>{ann.title}</h4>
              <p
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {ann.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={applyLeaveModalOpen}
        onClose={() => setApplyLeaveModalOpen(false)}
        title="Apply For Leave"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setApplyLeaveModalOpen(false)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleApplyLeave}
              disabled={submittingLeave}
            >
              {submittingLeave ? 'Submitting...' : 'Submit Application'}
            </button>
          </>
        }
      >
        <form onSubmit={handleApplyLeave}>
          <div className="form-group">
            <label className="form-label">Leave Type</label>
            <select
              className="select-field"
              value={leaveForm.leaveType}
              onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
            >
              <option value="Casual Leave">Casual Leave</option>
              <option value="Annual Leave">Annual Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Emergency Leave">Emergency Leave</option>
              <option value="Maternity / Paternity">Maternity / Paternity</option>
              <option value="Unpaid Leave">Unpaid Leave</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="input-field"
                value={leaveForm.startDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="input-field"
                value={leaveForm.endDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reason for Leave</label>
            <textarea
              className="textarea-field"
              placeholder="State the reason for your time-off request..."
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
