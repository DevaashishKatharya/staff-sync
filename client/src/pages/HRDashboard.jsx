import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { Modal } from '../components/Modal';
import {
  Users,
  Clock,
  CalendarCheck,
  Megaphone,
  UserPlus,
  CheckCircle,
  XCircle,
  Building2,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export const HRDashboard = ({ setActiveTab }) => {
  const { employee, showToast } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [departmentBreakdown, setDepartmentBreakdown] = useState([]);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review leave modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewAction, setReviewAction] = useState('Approved');
  const [reviewerComments, setReviewerComments] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Post Announcement Modal
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    category: 'General',
    priority: 'Medium',
    targetDepartment: 'All',
    isPinned: false,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.reports.getHRMetrics();
      if (res.success) {
        setMetrics(res.metrics);
        setDepartmentBreakdown(res.departmentBreakdown || []);
        setRecentLeaves(res.recentLeaves || []);
        setRecentAnnouncements(res.recentAnnouncements || []);
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

  const handleOpenReview = (leave, action) => {
    setSelectedLeave(leave);
    setReviewAction(action);
    setReviewerComments('');
    setReviewModalOpen(true);
  };

  const submitReview = async () => {
    if (!selectedLeave) return;
    try {
      setSubmittingReview(true);
      const res = await api.leaves.review(selectedLeave._id, {
        status: reviewAction,
        reviewerComments,
      });
      if (res.success) {
        showToast(`Leave request ${reviewAction.toLowerCase()} successfully.`, 'success');
        setReviewModalOpen(false);
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) {
      showToast('Please provide title and content', 'warning');
      return;
    }
    try {
      const res = await api.announcements.create(newAnnouncement);
      if (res.success) {
        showToast('Announcement posted successfully!', 'success');
        setAnnouncementModalOpen(false);
        setNewAnnouncement({
          title: '',
          content: '',
          category: 'General',
          priority: 'Medium',
          targetDepartment: 'All',
          isPinned: false,
        });
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading HR Analytics & Workforce Metrics...</div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">
            <ShieldCheck size={28} style={{ color: '#c084fc' }} />
            <span>HR Executive Dashboard</span>
          </div>
          <div className="page-subtitle">
            Welcome back, {employee?.fullName || 'HR Director'} • Workforce control, attendance monitoring, and administrative governance
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setAnnouncementModalOpen(true)}
          >
            <Megaphone size={16} />
            <span>Broadcast News</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setActiveTab('employees')}
          >
            <UserPlus size={16} />
            <span>Manage Employees</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Workforce"
          value={metrics?.totalEmployees || 0}
          icon={Users}
          color="purple"
          subtext={`${metrics?.activeEmployees || 0} Active • ${metrics?.onLeaveEmployees || 0} On Leave`}
          onClick={() => setActiveTab('employees')}
        />
        <StatCard
          title="Today's Attendance Rate"
          value={`${metrics?.attendanceRate || 0}%`}
          icon={Clock}
          color="success"
          badge={`${metrics?.presentToday || 0} Present`}
          subtext={`${metrics?.lateToday || 0} late arrivals logged`}
          onClick={() => setActiveTab('attendance')}
        />
        <StatCard
          title="Pending Leave Requests"
          value={metrics?.pendingLeaves || 0}
          icon={CalendarCheck}
          color="warning"
          badge={metrics?.pendingLeaves > 0 ? 'Action Required' : 'All Clear'}
          subtext="Submissions waiting for approval"
          onClick={() => setActiveTab('leaves')}
        />
        <StatCard
          title="Training Programs"
          value={metrics?.totalTrainings || 0}
          icon={TrendingUp}
          color="secondary"
          subtext="Active corporate development courses"
          onClick={() => setActiveTab('training')}
        />
      </div>

      {/* Two Column Grid */}
      <div className="two-col-grid" style={{ marginBottom: '28px' }}>
        {/* Left: Pending Leave Approvals Queue */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Pending Leave Approvals</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Review employee time-off requests with real-time updates
              </p>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setActiveTab('leaves')}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {recentLeaves.filter((l) => l.status === 'Pending').length === 0 ? (
            <div
              style={{
                padding: '36px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <CheckCircle size={32} style={{ color: 'var(--success)', marginBottom: '8px' }} />
              <div>All pending leave requests have been reviewed!</div>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Duration</th>
                    <th>Reason</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeaves
                    .filter((l) => l.status === 'Pending')
                    .map((leave) => (
                      <tr key={leave._id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{leave.employee?.firstName} {leave.employee?.lastName}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {leave.employee?.employeeId} • {leave.employee?.department}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-info">{leave.leaveType}</span>
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>
                          {new Date(leave.startDate).toLocaleDateString()} -{' '}
                          {new Date(leave.endDate).toLocaleDateString()}
                        </td>
                        <td style={{ fontWeight: 600 }}>{leave.daysCount} d</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '200px' }}>
                          {leave.reason}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleOpenReview(leave, 'Approved')}
                              title="Approve leave"
                            >
                              <CheckCircle size={14} /> Approve
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleOpenReview(leave, 'Rejected')}
                              title="Reject leave"
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Department Workforce Distribution */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <Building2 size={20} style={{ color: 'var(--primary-light)' }} />
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Department Breakdown</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Staff headcount distribution
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {departmentBreakdown.map((dept) => {
              const total = metrics?.totalEmployees || 1;
              const percent = Math.round((dept.count / total) * 100);

              return (
                <div key={dept.department}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600 }}>{dept.department}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {dept.count} members ({percent}%)
                    </span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${percent}%`,
                        background: 'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Announcements Feed */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>Company Announcements & News</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Latest updates visible across all employee and manager portals
            </p>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setActiveTab('announcements')}
          >
            <span>Manage All</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="three-col-grid">
          {recentAnnouncements.map((ann) => (
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
              <h4 style={{ fontSize: '0.95rem', marginBottom: '8px' }}>{ann.title}</h4>
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

      {/* Review Leave Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={`${reviewAction} Leave Application`}
        footer={
          <>
            <button
              className="btn btn-outline"
              onClick={() => setReviewModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className={`btn ${reviewAction === 'Approved' ? 'btn-success' : 'btn-danger'}`}
              onClick={submitReview}
              disabled={submittingReview}
            >
              {submittingReview ? 'Processing...' : `Confirm ${reviewAction}`}
            </button>
          </>
        }
      >
        {selectedLeave && (
          <div>
            <div
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.03)',
                marginBottom: '18px',
                fontSize: '0.88rem',
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                {selectedLeave.employee?.firstName} {selectedLeave.employee?.lastName} ({selectedLeave.employee?.employeeId})
              </div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Type: <strong>{selectedLeave.leaveType}</strong> • Duration: <strong>{selectedLeave.daysCount} days</strong>
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>
                Reason: "{selectedLeave.reason}"
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Review Remarks / Notes (Optional)</label>
              <textarea
                className="textarea-field"
                placeholder="Enter feedback or approval notes..."
                value={reviewerComments}
                onChange={(e) => setReviewerComments(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Broadcast Announcement Modal */}
      <Modal
        isOpen={announcementModalOpen}
        onClose={() => setAnnouncementModalOpen(false)}
        title="Broadcast Organization Announcement"
        footer={
          <>
            <button
              className="btn btn-outline"
              onClick={() => setAnnouncementModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handlePostAnnouncement}
            >
              Publish Announcement
            </button>
          </>
        }
      >
        <form onSubmit={handlePostAnnouncement}>
          <div className="form-group">
            <label className="form-label">Announcement Title</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g., Company Town Hall & Strategy Review"
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="select-field"
                value={newAnnouncement.category}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, category: e.target.value })}
              >
                <option value="General">General</option>
                <option value="Company News">Company News</option>
                <option value="HR Policy">HR Policy</option>
                <option value="Events">Events</option>
                <option value="Health & Safety">Health & Safety</option>
                <option value="Urgent Notice">Urgent Notice</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="select-field"
                value={newAnnouncement.priority}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Message Content</label>
            <textarea
              className="textarea-field"
              placeholder="Write the full announcement message..."
              value={newAnnouncement.content}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <input
              type="checkbox"
              id="isPinned"
              checked={newAnnouncement.isPinned}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, isPinned: e.target.checked })}
            />
            <label htmlFor="isPinned" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Pin announcement to top of feed
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
};
