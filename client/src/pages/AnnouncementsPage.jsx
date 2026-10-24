import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import {
  Megaphone,
  Plus,
  Pin,
  Trash2,
  Filter,
  Calendar,
  AlertTriangle,
  Sparkles,
  Shield,
  Briefcase,
} from 'lucide-react';

export const AnnouncementsPage = () => {
  const { role, employee, showToast } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    category: 'General',
    priority: 'Medium',
    targetDepartment: 'All',
    isPinned: false,
  });

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.announcements.getAll({
        category: categoryFilter,
        priority: priorityFilter,
      });
      if (res.success) {
        setAnnouncements(res.announcements);
      }
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, [categoryFilter, priorityFilter]);

  const submitCreate = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) {
      showToast('Please provide title and content', 'warning');
      return;
    }
    try {
      const res = await api.announcements.create(newAnnouncement);
      if (res.success) {
        showToast('Announcement broadcasted successfully!', 'success');
        setCreateModalOpen(false);
        setNewAnnouncement({
          title: '',
          content: '',
          category: 'General',
          priority: 'Medium',
          targetDepartment: 'All',
          isPinned: false,
        });
        loadAnnouncements();
      }
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      const res = await api.announcements.delete(id);
      if (res.success) {
        showToast(res.message, 'success');
        loadAnnouncements();
      }
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">
            <Megaphone size={28} style={{ color: '#fbbf24' }} />
            <span>Company Announcements & Internal Updates</span>
          </div>
          <div className="page-subtitle">
            Organization-wide news, HR policies, executive memos, and squad notifications
          </div>
        </div>

        {['hr', 'manager'].includes(role) && (
          <button className="btn btn-primary" onClick={() => setCreateModalOpen(true)}>
            <Plus size={16} />
            <span>Broadcast News</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
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
            Filter Updates:
          </span>
        </div>

        <select
          className="select-field"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ width: 'auto', padding: '8px 12px' }}
        >
          <option value="All">All Categories</option>
          <option value="General">General</option>
          <option value="Company News">Company News</option>
          <option value="HR Policy">HR Policy</option>
          <option value="Events">Events</option>
          <option value="Health & Safety">Health & Safety</option>
          <option value="Urgent Notice">Urgent Notice</option>
        </select>

        <select
          className="select-field"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          style={{ width: 'auto', padding: '8px 12px' }}
        >
          <option value="All">All Priorities</option>
          <option value="Urgent">Urgent</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Announcements Feed */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          Loading announcements...
        </div>
      ) : announcements.length === 0 ? (
        <div
          className="glass-panel"
          style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}
        >
          No announcements found matching your filter.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {announcements.map((ann) => {
            const canDelete =
              role === 'hr' || (ann.author && ann.author._id === employee?._id);

            return (
              <div
                key={ann._id}
                className="glass-panel"
                style={{
                  padding: '24px',
                  borderLeft: ann.isPinned
                    ? '4px solid var(--primary)'
                    : ann.priority === 'Urgent'
                    ? '4px solid var(--danger)'
                    : '1px solid var(--border-subtle)',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {ann.isPinned && (
                      <span className="badge badge-purple" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Pin size={12} /> Pinned
                      </span>
                    )}
                    <span
                      className={`badge ${
                        ann.priority === 'Urgent'
                          ? 'badge-danger'
                          : ann.priority === 'High'
                          ? 'badge-warning'
                          : 'badge-info'
                      }`}
                    >
                      {ann.priority} Priority
                    </span>
                    <span className="badge badge-neutral">{ann.category}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Target: <strong>{ann.targetDepartment}</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {new Date(ann.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    {canDelete && (
                      <button
                        className="btn btn-outline btn-icon btn-sm"
                        style={{ color: '#fb7185' }}
                        onClick={() => handleDelete(ann._id)}
                        title="Delete Announcement"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: 'var(--text-primary)' }}>
                  {ann.title}
                </h3>

                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.92rem', whiteSpace: 'pre-line' }}>
                  {ann.content}
                </p>

                <div
                  style={{
                    marginTop: '16px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span>Published by:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>
                    {ann.author ? `${ann.author.firstName} ${ann.author.lastName}` : 'Leadership'}
                  </strong>
                  {ann.author?.designation && <span>({ann.author.designation})</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Broadcast Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Broadcast Internal Announcement"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={submitCreate}>
              Publish Announcement
            </button>
          </>
        }
      >
        <form onSubmit={submitCreate}>
          <div className="form-group">
            <label className="form-label">Title / Headline</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Q4 Town Hall and Strategic Directions"
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
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
            <label className="form-label">Target Audience / Department</label>
            <select
              className="select-field"
              value={newAnnouncement.targetDepartment}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, targetDepartment: e.target.value })}
            >
              <option value="All">All Organization</option>
              <option value="Engineering">Engineering Only</option>
              <option value="Human Resources">Human Resources Only</option>
              <option value="Product & Design">Product & Design Only</option>
              <option value="Finance & Operations">Finance & Operations Only</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Message Content</label>
            <textarea
              className="textarea-field"
              placeholder="Provide the complete message or notice..."
              value={newAnnouncement.content}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
            <input
              type="checkbox"
              id="annPinned"
              checked={newAnnouncement.isPinned}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, isPinned: e.target.checked })}
            />
            <label htmlFor="annPinned" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Pin announcement to top of feed
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
};
