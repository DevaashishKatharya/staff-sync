import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { Modal } from '../components/Modal';
import {
  Users,
  CalendarCheck,
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle,
  Briefcase,
  Plus,
  ArrowRight,
  TrendingUp,
  UserCheck,
} from 'lucide-react';

export const ManagerDashboard = ({ setActiveTab }) => {
  const { employee, showToast } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamTrainings, setTeamTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewAction, setReviewAction] = useState('Approved');
  const [reviewerComments, setReviewerComments] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // New Training modal
  const [trainingModalOpen, setTrainingModalOpen] = useState(false);
  const [newTraining, setNewTraining] = useState({
    title: '',
    description: '',
    category: 'Engineering & Tech',
    instructor: '',
    duration: '12 Hours',
    startDate: '',
    endDate: '',
    assignedEmployeeIds: [],
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.reports.getManagerMetrics();
      if (res.success) {
        setMetrics(res.metrics);
        setPendingLeaves(res.pendingLeaves || []);
        setTeamMembers(res.teamMembers || []);
        setTeamTrainings(res.teamTrainings || []);
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
        showToast(`Team leave request ${reviewAction.toLowerCase()} successfully.`, 'success');
        setReviewModalOpen(false);
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCreateTraining = async (e) => {
    e.preventDefault();
    if (!newTraining.title || !newTraining.instructor || !newTraining.startDate || !newTraining.endDate) {
      showToast('Please fill all required fields', 'warning');
      return;
    }
    try {
      const res = await api.training.create(newTraining);
      if (res.success) {
        showToast('Training program launched and assigned!', 'success');
        setTrainingModalOpen(false);
        setNewTraining({
          title: '',
          description: '',
          category: 'Engineering & Tech',
          instructor: '',
          duration: '12 Hours',
          startDate: '',
          endDate: '',
          assignedEmployeeIds: [],
        });
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const toggleEmployeeSelection = (id) => {
    const current = newTraining.assignedEmployeeIds;
    if (current.includes(id)) {
      setNewTraining({ ...newTraining, assignedEmployeeIds: current.filter((x) => x !== id) });
    } else {
      setNewTraining({ ...newTraining, assignedEmployeeIds: [...current, id] });
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading Manager Team Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">
            <Briefcase size={28} style={{ color: '#38bdf8' }} />
            <span>Manager Team Dashboard</span>
          </div>
          <div className="page-subtitle">
            Welcome back, {employee?.fullName || 'Manager'} • Overseeing {employee?.department || 'Department'} Team operations, leave approvals, and training
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-primary"
            onClick={() => setTrainingModalOpen(true)}
          >
            <Plus size={16} />
            <span>New Training Program</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        <StatCard
          title="Team Members"
          value={metrics?.teamSize || 0}
          icon={Users}
          color="secondary"
          subtext={`Direct reports in ${employee?.department || 'Team'}`}
          onClick={() => setActiveTab('employees')}
        />
        <StatCard
          title="Team Present Today"
          value={metrics?.teamPresentToday || 0}
          icon={Clock}
          color="success"
          badge={`${metrics?.teamAttendanceRate || 0}%`}
          subtext="Daily active check-ins"
          onClick={() => setActiveTab('attendance')}
        />
        <StatCard
          title="Pending Leave Requests"
          value={metrics?.pendingLeavesCount || 0}
          icon={CalendarCheck}
          color="warning"
          badge={metrics?.pendingLeavesCount > 0 ? 'Requires Action' : 'All Clear'}
          subtext="Applications from your direct reports"
          onClick={() => setActiveTab('leaves')}
        />
        <StatCard
          title="Active Trainings"
          value={metrics?.activeTrainingsCount || 0}
          icon={GraduationCap}
          color="primary"
          subtext="Team skill development programs"
          onClick={() => setActiveTab('training')}
        />
      </div>

      {/* Pending Leave Requests Section */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>Team Leave Requests to Review</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Approve or reject time-off requests submitted by your team members
            </p>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setActiveTab('leaves')}
          >
            <span>All Requests</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {pendingLeaves.length === 0 ? (
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
            <div>No pending leave requests from your team at this time!</div>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingLeaves.map((leave) => (
                  <tr key={leave._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {leave.employee?.firstName} {leave.employee?.lastName}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {leave.employee?.employeeId} • {leave.employee?.designation}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{leave.leaveType}</span>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>
                      {new Date(leave.startDate).toLocaleDateString()} -{' '}
                      {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td style={{ fontWeight: 600 }}>{leave.daysCount} days</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '240px' }}>
                      {leave.reason}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleOpenReview(leave, 'Approved')}
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleOpenReview(leave, 'Rejected')}
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

      {/* Two Column Grid: Team Members & Active Trainings */}
      <div className="two-col-grid">
        {/* Left: Training & Development Tracking */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Team Training Programs</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Track employee progress & completion
              </p>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setActiveTab('training')}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {teamTrainings.map((program) => (
              <div
                key={program._id}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '0.95rem' }}>{program.title}</h4>
                  <span className="badge badge-purple">{program.category}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Instructor: {program.instructor} • {program.duration}
                </div>

                {/* Enrolled participants progress */}
                {program.enrolledEmployees?.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {program.enrolledEmployees.map((enrollment) => (
                      <div key={enrollment._id || enrollment.employee?._id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                          <span>
                            {enrollment.employee?.firstName} {enrollment.employee?.lastName}
                          </span>
                          <span style={{ fontWeight: 600, color: 'var(--primary-light)' }}>
                            {enrollment.progress}% ({enrollment.status})
                          </span>
                        </div>
                        <div className="progress-bar-bg">
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${enrollment.progress}%`,
                              background: enrollment.progress === 100 ? 'var(--success)' : 'var(--primary)',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Managed Team Roster */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <Users size={20} style={{ color: '#38bdf8' }} />
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Team Members Roster</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {teamMembers.length} team members under supervision
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {teamMembers.map((member) => (
              <div
                key={member._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(6, 182, 212, 0.2)',
                      color: '#38bdf8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                    }}
                  >
                    {member.firstName[0]}
                    {member.lastName[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      {member.firstName} {member.lastName}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {member.designation}
                    </div>
                  </div>
                </div>

                <span
                  className={`badge ${
                    member.status === 'Active'
                      ? 'badge-success'
                      : member.status === 'On Leave'
                      ? 'badge-warning'
                      : 'badge-neutral'
                  }`}
                >
                  {member.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Leave Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={`${reviewAction} Team Leave Application`}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setReviewModalOpen(false)}>
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
                {selectedLeave.employee?.firstName} {selectedLeave.employee?.lastName}
              </div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                {selectedLeave.leaveType} • {selectedLeave.daysCount} days
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>
                Reason: "{selectedLeave.reason}"
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Manager Feedback / Comments</label>
              <textarea
                className="textarea-field"
                placeholder="Add approval notes or handover remarks..."
                value={reviewerComments}
                onChange={(e) => setReviewerComments(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Create Training Modal */}
      <Modal
        isOpen={trainingModalOpen}
        onClose={() => setTrainingModalOpen(false)}
        title="Create & Assign Training Program"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setTrainingModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCreateTraining}>
              Launch Program
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateTraining}>
          <div className="form-group">
            <label className="form-label">Program Title</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g., Cloud Architecture & Docker Mastery"
              value={newTraining.title}
              onChange={(e) => setNewTraining({ ...newTraining, title: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="select-field"
                value={newTraining.category}
                onChange={(e) => setNewTraining({ ...newTraining, category: e.target.value })}
              >
                <option value="Engineering & Tech">Engineering & Tech</option>
                <option value="Management & Leadership">Management & Leadership</option>
                <option value="Design & UI/UX">Design & UI/UX</option>
                <option value="Compliance & Security">Compliance & Security</option>
                <option value="Productivity">Productivity</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Duration</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., 10 Hours"
                value={newTraining.duration}
                onChange={(e) => setNewTraining({ ...newTraining, duration: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Instructor</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g., Elena Vance or External Partner"
              value={newTraining.instructor}
              onChange={(e) => setNewTraining({ ...newTraining, instructor: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="input-field"
                value={newTraining.startDate}
                onChange={(e) => setNewTraining({ ...newTraining, startDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="input-field"
                value={newTraining.endDate}
                onChange={(e) => setNewTraining({ ...newTraining, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description / Objectives</label>
            <textarea
              className="textarea-field"
              placeholder="Outline what skills the team will acquire..."
              value={newTraining.description}
              onChange={(e) => setNewTraining({ ...newTraining, description: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assign Team Members</label>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                maxHeight: '140px',
                overflowY: 'auto',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 12px',
              }}
            >
              {teamMembers.map((member) => (
                <label
                  key={member._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={newTraining.assignedEmployeeIds.includes(member._id)}
                    onChange={() => toggleEmployeeSelection(member._id)}
                  />
                  <span>
                    {member.firstName} {member.lastName} ({member.designation})
                  </span>
                </label>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
