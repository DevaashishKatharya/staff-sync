import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Shield,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export const EmployeesManagement = () => {
  const { role, showToast } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'Engineering',
    designation: '',
    role: 'employee',
    salary: 65000,
    skills: '',
    password: 'password123',
  });

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.employees.getAll({
        search,
        department: selectedDept,
        status: selectedStatus,
      });
      if (res.success) {
        setEmployees(res.employees);
      }
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [selectedDept, selectedStatus]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadEmployees();
  };

  const handleOpenAdd = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: 'Engineering',
      designation: '',
      role: 'employee',
      salary: 65000,
      skills: '',
      password: 'password123',
    });
    setAddModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setSelectedEmp(emp);
    setFormData({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone || '',
      department: emp.department,
      designation: emp.designation,
      role: emp.role,
      salary: emp.salary,
      skills: emp.skills ? emp.skills.join(', ') : '',
    });
    setEditModalOpen(true);
  };

  const handleOpenView = (emp) => {
    setSelectedEmp(emp);
    setViewModalOpen(true);
  };

  const handleOpenDelete = (emp) => {
    setSelectedEmp(emp);
    setDeleteModalOpen(true);
  };

  const submitAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await api.employees.create(formData);
      if (res.success) {
        showToast(res.message, 'success');
        setAddModalOpen(false);
        loadEmployees();
      }
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.employees.update(selectedEmp._id, formData);
      if (res.success) {
        showToast(res.message, 'success');
        setEditModalOpen(false);
        loadEmployees();
      }
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const submitDelete = async () => {
    try {
      const res = await api.employees.delete(selectedEmp._id);
      if (res.success) {
        showToast(res.message, 'success');
        setDeleteModalOpen(false);
        loadEmployees();
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
            <Users size={28} style={{ color: '#c084fc' }} />
            <span>Employee Directory & Records</span>
          </div>
          <div className="page-subtitle">
            Comprehensive workforce management, onboarding, credential provisioning, and role assignment
          </div>
        </div>

        {role === 'hr' && (
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <UserPlus size={16} />
            <span>Add New Employee</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', flex: '1', minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
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
              type="text"
              className="input-field"
              placeholder="Search by name, ID, designation, or email..."
              style={{ paddingLeft: '38px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
            <select
              className="select-field"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{ padding: '8px 12px' }}
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Product & Design">Product & Design</option>
              <option value="Finance & Operations">Finance & Operations</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>

          <select
            className="select-field"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ padding: '8px 12px' }}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            Loading employee records...
          </div>
        ) : employees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No employee records match the filter criteria.
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>ID</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Contact</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                            border: '1px solid var(--border-medium)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            color: 'var(--text-primary)',
                          }}
                        >
                          {emp.firstName[0]}
                          {emp.lastName[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{emp.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {emp.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.8rem',
                          padding: '2px 6px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        {emp.employeeId}
                      </span>
                    </td>
                    <td>{emp.department}</td>
                    <td>{emp.designation}</td>
                    <td>
                      <span className={`role-badge role-badge-${emp.role}`}>
                        {emp.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          emp.status === 'Active'
                            ? 'badge-success'
                            : emp.status === 'On Leave'
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {emp.phone || 'N/A'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn btn-outline btn-icon btn-sm"
                          onClick={() => handleOpenView(emp)}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        {role === 'hr' && (
                          <>
                            <button
                              className="btn btn-secondary btn-icon btn-sm"
                              onClick={() => handleOpenEdit(emp)}
                              title="Edit Employee"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn btn-outline btn-icon btn-sm"
                              style={{ color: '#fb7185' }}
                              onClick={() => handleOpenDelete(emp)}
                              title="Delete Employee"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Employee Modal (HR Only) */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add & Provision New Employee"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={submitAdd}>
              Save & Create Credentials
            </button>
          </>
        }
      >
        <form onSubmit={submitAdd}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="Jane"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Corporate Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="jane.doe@staffsync.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="input-field"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                className="select-field"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Product & Design">Product & Design</option>
                <option value="Finance & Operations">Finance & Operations</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Designation</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Senior Software Engineer"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">System Role</label>
              <select
                className="select-field"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR Personnel</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Annual Salary ($)</label>
              <input
                type="number"
                className="input-field"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Skills (Comma-separated)</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g., React, TypeScript, Docker"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Initial Password for Portal</label>
            <input
              type="text"
              className="input-field"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Employee: ${selectedEmp?.fullName}`}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={submitEdit}>
              Update Details
            </button>
          </>
        }
      >
        <form onSubmit={submitEdit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                className="input-field"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className="input-field"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                className="select-field"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Product & Design">Product & Design</option>
                <option value="Finance & Operations">Finance & Operations</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Designation</label>
              <input
                type="text"
                className="input-field"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">System Role</label>
              <select
                className="select-field"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR Personnel</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Annual Salary ($)</label>
              <input
                type="number"
                className="input-field"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              type="text"
              className="input-field"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Skills (Comma-separated)</label>
            <input
              type="text"
              className="input-field"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* View Employee Detail Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Employee Profile Details"
        footer={
          <button className="btn btn-outline" onClick={() => setViewModalOpen(false)}>
            Close
          </button>
        }
      >
        {selectedEmp && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#fff',
                }}
              >
                {selectedEmp.firstName[0]}
                {selectedEmp.lastName[0]}
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '2px' }}>{selectedEmp.fullName}</h3>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {selectedEmp.designation} • {selectedEmp.department}
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  <span className={`role-badge role-badge-${selectedEmp.role}`}>{selectedEmp.role}</span>
                  <span className={`badge ${selectedEmp.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                    {selectedEmp.status}
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '14px',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '16px',
                fontSize: '0.85rem',
              }}
            >
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Employee ID</div>
                <div style={{ fontWeight: 600 }}>{selectedEmp.employeeId}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Corporate Email</div>
                <div style={{ fontWeight: 600 }}>{selectedEmp.email}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Phone</div>
                <div style={{ fontWeight: 600 }}>{selectedEmp.phone || 'N/A'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Annual Salary</div>
                <div style={{ fontWeight: 600 }}>${selectedEmp.salary?.toLocaleString()} / yr</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Joined Date</div>
                <div style={{ fontWeight: 600 }}>
                  {new Date(selectedEmp.dateOfJoining).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Manager</div>
                <div style={{ fontWeight: 600 }}>
                  {selectedEmp.manager
                    ? `${selectedEmp.manager.firstName} ${selectedEmp.manager.lastName}`
                    : 'Executive Board'}
                </div>
              </div>
            </div>

            {selectedEmp.skills?.length > 0 && (
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Skills & Expertise
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedEmp.skills.map((skill, i) => (
                    <span key={i} className="badge badge-purple">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Employee Removal"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={submitDelete}>
              Delete Record & Credentials
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Are you sure you want to permanently delete employee{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{selectedEmp?.fullName}</strong> (
          {selectedEmp?.employeeId})? This will also remove their portal authentication login.
        </p>
      </Modal>
    </div>
  );
};
