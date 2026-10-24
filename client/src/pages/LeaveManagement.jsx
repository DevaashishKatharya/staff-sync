import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { StatCard } from '../components/StatCard';
import {
  CalendarCheck,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Search,
  Calendar,
  AlertCircle,
  Shield,
  Briefcase,
} from 'lucide-react';

export const LeaveManagement = () => {
  const { role, employee, showToast } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [summary, setSummary] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [myStats, setMyStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');

  // Apply Modal
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({
    leaveType: 'Casual Leave',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [submittingApply, setSubmittingApply] = useState(false);

  // Review Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewAction, setReviewAction] = useState('Approved');
  const [reviewerComments, setReviewerComments] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadLeaves = async () => {
    try {
      setLoading(true);
      if (role === 'employee') {
        const res = await api.leaves.getMyLeaves();
        if (res.success) {
          setLeaves(res.leaves);
          setMyStats(res.stats);
        }
      } else {
        const res = await api.leaves.getAll({
          status: statusFilter,
          department: deptFilter,
        });
        if (res.success) {
          setLeaves(res.leaves);
          setSummary(res.summary);
        }
      }
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [statusFilter, deptFilter, role]);

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
        loadLeaves();
      }
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setSubmittingReview(false);
    }
  };

  const submitApply = async (e) => {
    e.preventDefault();
    if (!applyForm.startDate || !applyForm.endDate || !applyForm.reason) {
      showToast('Please provide all required fields.', 'warning');
      return;
    }
    try {
      setSubmittingApply(true);
      const res = await api.leaves.apply(applyForm);
      if (res.success) {
        showToast('Leave request submitted successfully!', 'success');
        setApplyModalOpen(false);
        setApplyForm({
          leaveType: 'Casual Leave',
          startDate: '',
          endDate: '',
          reason: '',
        });
        loadLeaves();
      }
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setSubmittingApply(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">
            <CalendarCheck size={28} style={{ color: 'var(--primary-light)' }} />
            <span>Leave Management & Approvals</span>
          </div>
          <div className="page-subtitle">
            {role === 'employee'
              ? 'Check remaining quotas, apply for time off, and track reviewer feedback'
              : 'Review, approve, or reject employee leave applications across departments'}
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setApplyModalOpen(true)}>
          <Plus size={16} />
          <span>Apply For Leave</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        {role === 'employee' ? (
          <>
            <StatCard
              title="Remaining Balance"
              value={`${myStats?.remainingBalance || 0} Days`}
              icon={CalendarCheck}
              color="success"
              subtext="Annual leave balance"
            />
            <StatCard
              title="Total Days Taken"
              value={`${myStats?.totalLeavesTaken || 0} Days`}
              icon={Clock}
              color="purple"
              subtext="Approved leave days"
            />
            <StatCard
              title="Annual Quota"
              value={`${myStats?.allocatedAnnualAllowance || 24} Days`}
              icon={Calendar}
              color="primary"
              subtext="Standard corporate entitlement"
            />
            <StatCard
              title="Pending Approvals"
              value={myStats?.pendingApprovals || 0}
              icon={AlertCircle}
              color="warning"
              subtext="Awaiting manager sign-off"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Pending Requests"
              value={summary.pending}
              icon={Clock}
              color="warning"
              badge={summary.pending > 0 ? 'Action Required' : 'All Clear'}
              subtext="Awaiting review"
            />
            <StatCard
              title="Approved Requests"
              value={summary.approved}
              icon={CheckCircle}
              color="success"
              subtext="Authorized leaves"
            />
            <StatCard
              title="Rejected Requests"
              value={summary.rejected}
              icon={XCircle}
              color="danger"
              subtext="Declined requests"
            />
            <StatCard
              title="Total Submissions"
              value={summary.total}
              icon={CalendarCheck}
              color="primary"
              subtext="All historical requests"
            />
          </>
        )}
      </div>

      {/* Filter Toolbar (for HR/Manager) */}
      {role !== 'employee' && (
        <div
          className="glass-panel"
          style={{
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Filters:
            </span>
          </div>

          <select
            className="select-field"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto', padding: '8px 12px' }}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending Only</option>
            <option value="Approved">Approved Only</option>
            <option value="Rejected">Rejected Only</option>
          </select>

          <select
            className="select-field"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            style={{ width: 'auto', padding: '8px 12px' }}
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Product & Design">Product & Design</option>
            <option value="Finance & Operations">Finance & Operations</option>
          </select>
        </div>
      )}

      {/* Leave Requests Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            Loading leave applications...
          </div>
        ) : leaves.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No leave records found matching the criteria.
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {role !== 'employee' && <th>Employee</th>}
                  <th>Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Reviewer / Remarks</th>
                  {role !== 'employee' && <th style={{ textAlign: 'right' }}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave._id}>
                    {role !== 'employee' && (
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {leave.employee?.firstName} {leave.employee?.lastName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {leave.employee?.employeeId} • {leave.employee?.department}
                        </div>
                      </td>
                    )}
                    <td>
                      <span className="badge badge-info">{leave.leaveType}</span>
                    </td>
                    <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                    <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 600 }}>{leave.daysCount} days</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '200px' }}>
                      {leave.reason}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          leave.status === 'Approved'
                            ? 'badge-success'
                            : leave.status === 'Rejected'
                            ? 'badge-danger'
                            : 'badge-warning'
                        }`}
                      >
                        {leave.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {leave.reviewerComments || (leave.status === 'Pending' ? 'Awaiting Review' : 'No comments')}
                    </td>
                    {role !== 'employee' && (
                      <td style={{ textAlign: 'right' }}>
                        {leave.status === 'Pending' ? (
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleOpenReview(leave, 'Approved')}
                              title="Approve"
                            >
                              <CheckCircle size={14} /> Approve
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleOpenReview(leave, 'Rejected')}
                              title="Reject"
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Reviewed
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title="Submit Leave Application"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setApplyModalOpen(false)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={submitApply}
              disabled={submittingApply}
            >
              {submittingApply ? 'Submitting...' : 'Submit Request'}
            </button>
          </>
        }
      >
        <form onSubmit={submitApply}>
          <div className="form-group">
            <label className="form-label">Leave Type</label>
            <select
              className="select-field"
              value={applyForm.leaveType}
              onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value })}
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
                value={applyForm.startDate}
                onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="input-field"
                value={applyForm.endDate}
                onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reason for Request</label>
            <textarea
              className="textarea-field"
              placeholder="Provide context and notes for your manager/HR..."
              value={applyForm.reason}
              onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
              required
            />
          </div>
        </form>
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={`${reviewAction} Leave Application`}
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
                marginBottom: '16px',
                fontSize: '0.85rem',
              }}
            >
              <div style={{ fontWeight: 700 }}>
                {selectedLeave.employee?.firstName} {selectedLeave.employee?.lastName} ({selectedLeave.employee?.employeeId})
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>
                {selectedLeave.leaveType} • {selectedLeave.daysCount} days
              </div>
              <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                Reason: "{selectedLeave.reason}"
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Review Remarks (Optional)</label>
              <textarea
                className="textarea-field"
                placeholder="Add comments or handover notes..."
                value={reviewerComments}
                onChange={(e) => setReviewerComments(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
