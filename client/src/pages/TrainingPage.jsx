import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { StatCard } from '../components/StatCard';
import {
  GraduationCap,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  UserPlus,
  BookOpen,
  Calendar,
  Layers,
} from 'lucide-react';

export const TrainingPage = () => {
  const { role, employee, showToast } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);

  // Form states
  const [newProgram, setNewProgram] = useState({
    title: '',
    description: '',
    category: 'Engineering & Tech',
    instructor: '',
    duration: '10 Hours',
    department: 'All',
    startDate: '',
    endDate: '',
  });

  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [progressValue, setProgressValue] = useState(0);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.training.getAll();
      if (res.success) {
        setPrograms(res.programs);
      }
      if (['hr', 'manager'].includes(role)) {
        const empRes = await api.employees.getAll();
        if (empRes.success) {
          setAllEmployees(empRes.employees);
        }
      }
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [role]);

  const handleOpenAssign = (program) => {
    setSelectedProgram(program);
    setSelectedEmployeeIds([]);
    setAssignModalOpen(true);
  };

  const handleOpenProgress = (program, currentVal = 0) => {
    setSelectedProgram(program);
    setProgressValue(currentVal);
    setProgressModalOpen(true);
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.training.create(newProgram);
      if (res.success) {
        showToast('Training program created successfully!', 'success');
        setCreateModalOpen(false);
        setNewProgram({
          title: '',
          description: '',
          category: 'Engineering & Tech',
          instructor: '',
          duration: '10 Hours',
          department: 'All',
          startDate: '',
          endDate: '',
        });
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const submitAssign = async () => {
    if (!selectedProgram || selectedEmployeeIds.length === 0) {
      showToast('Please select at least one employee to enroll.', 'warning');
      return;
    }
    try {
      const res = await api.training.assign(selectedProgram._id, selectedEmployeeIds);
      if (res.success) {
        showToast('Employees enrolled successfully!', 'success');
        setAssignModalOpen(false);
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const submitProgress = async () => {
    if (!selectedProgram) return;
    try {
      const res = await api.training.updateProgress(selectedProgram._id, {
        progress: progressValue,
      });
      if (res.success) {
        showToast(`Progress updated to ${progressValue}%`, 'success');
        setProgressModalOpen(false);
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const toggleAssignEmployee = (empId) => {
    if (selectedEmployeeIds.includes(empId)) {
      setSelectedEmployeeIds(selectedEmployeeIds.filter((id) => id !== empId));
    } else {
      setSelectedEmployeeIds([...selectedEmployeeIds, empId]);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">
            <GraduationCap size={28} style={{ color: '#c084fc' }} />
            <span>Training & Professional Development</span>
          </div>
          <div className="page-subtitle">
            {['hr', 'manager'].includes(role)
              ? 'Create, assign, and monitor employee skill development programs and progress'
              : 'Upskill with corporate learning courses, complete modules, and track certifications'}
          </div>
        </div>

        {['hr', 'manager'].includes(role) && (
          <button className="btn btn-primary" onClick={() => setCreateModalOpen(true)}>
            <Plus size={16} />
            <span>Create New Program</span>
          </button>
        )}
      </div>

      {/* Program Stats */}
      <div className="stats-grid">
        <StatCard
          title="Active Programs"
          value={programs.filter((p) => p.status === 'In Progress').length}
          icon={BookOpen}
          color="primary"
          subtext="Currently running courses"
        />
        <StatCard
          title="Upcoming Programs"
          value={programs.filter((p) => p.status === 'Upcoming').length}
          icon={Calendar}
          color="secondary"
          subtext="Scheduled for next cycle"
        />
        <StatCard
          title="Completed Programs"
          value={programs.filter((p) => p.status === 'Completed').length}
          icon={CheckCircle2}
          color="success"
          subtext="Concluded courses"
        />
        <StatCard
          title="Total Enrollments"
          value={programs.reduce((acc, p) => acc + (p.enrolledEmployees?.length || 0), 0)}
          icon={Users}
          color="purple"
          subtext="Across all company tracks"
        />
      </div>

      {/* Program Cards Grid */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '18px' }}>Course Offerings & Squad Tracks</h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            Loading training programs...
          </div>
        ) : programs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No training programs scheduled at this time.
          </div>
        ) : (
          <div className="two-col-grid" style={{ gap: '24px' }}>
            {programs.map((program) => {
              // Check if current logged-in employee is enrolled
              const myEnrollment = program.enrolledEmployees?.find(
                (e) => e.employee?._id?.toString() === employee?._id?.toString()
              );

              return (
                <div
                  key={program._id}
                  className="glass-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <span className="badge badge-purple">{program.category}</span>
                      <span
                        className={`badge ${
                          program.status === 'Completed'
                            ? 'badge-success'
                            : program.status === 'In Progress'
                            ? 'badge-info'
                            : 'badge-neutral'
                        }`}
                      >
                        {program.status}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{program.title}</h4>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                      {program.description}
                    </p>

                    <div
                      style={{
                        padding: '12px 14px',
                        background: 'rgba(255, 255, 255, 0.025)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '16px',
                        fontSize: '0.8rem',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px',
                      }}
                    >
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Instructor: </span>
                        <strong>{program.instructor}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Duration: </span>
                        <strong>{program.duration}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Start: </span>
                        {new Date(program.startDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>End: </span>
                        {new Date(program.endDate).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Enrolled Participants */}
                    <div style={{ marginBottom: '16px' }}>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: 'var(--text-secondary)',
                          marginBottom: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>Enrolled Employees ({program.enrolledEmployees?.length || 0})</span>
                        {['hr', 'manager'].includes(role) && (
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                            onClick={() => handleOpenAssign(program)}
                          >
                            <UserPlus size={12} /> Assign Members
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {program.enrolledEmployees?.slice(0, 3).map((enr) => (
                          <div key={enr._id || enr.employee?._id} style={{ fontSize: '0.78rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                              <span>{enr.employee?.firstName} {enr.employee?.lastName}</span>
                              <span style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
                                {enr.progress}%
                              </span>
                            </div>
                            <div className="progress-bar-bg">
                              <div
                                className="progress-bar-fill"
                                style={{
                                  width: `${enr.progress}%`,
                                  background: enr.progress === 100 ? 'var(--success)' : 'var(--primary)',
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Employee personal updater action */}
                  {myEnrollment && (
                    <div
                      style={{
                        paddingTop: '12px',
                        borderTop: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--success)' }}>
                        You are enrolled • {myEnrollment.progress}% done
                      </span>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleOpenProgress(program, myEnrollment.progress)}
                      >
                        <TrendingUp size={14} /> Update Progress
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Program Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Training Program"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={submitCreate}>
              Publish Program
            </button>
          </>
        }
      >
        <form onSubmit={submitCreate}>
          <div className="form-group">
            <label className="form-label">Program Title</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g., Enterprise Microservices Architecture"
              value={newProgram.title}
              onChange={(e) => setNewProgram({ ...newProgram, title: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="select-field"
                value={newProgram.category}
                onChange={(e) => setNewProgram({ ...newProgram, category: e.target.value })}
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
                placeholder="e.g. 12 Hours"
                value={newProgram.duration}
                onChange={(e) => setNewProgram({ ...newProgram, duration: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Instructor Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="Dr. Gregory Vance"
              value={newProgram.instructor}
              onChange={(e) => setNewProgram({ ...newProgram, instructor: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="input-field"
                value={newProgram.startDate}
                onChange={(e) => setNewProgram({ ...newProgram, startDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="input-field"
                value={newProgram.endDate}
                onChange={(e) => setNewProgram({ ...newProgram, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Syllabus & Objectives</label>
            <textarea
              className="textarea-field"
              placeholder="Outline topics covered and learning outcomes..."
              value={newProgram.description}
              onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
              required
            />
          </div>
        </form>
      </Modal>

      {/* Assign Employees Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Enroll Employees into: ${selectedProgram?.title}`}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={submitAssign}>
              Enroll Selected Members
            </button>
          </>
        }
      >
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
          Select workforce members to assign to this training course:
        </p>

        <div
          style={{
            maxHeight: '260px',
            overflowY: 'auto',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {allEmployees.map((emp) => {
            const isAlreadyEnrolled = selectedProgram?.enrolledEmployees?.some(
              (e) => e.employee?._id?.toString() === emp._id.toString()
            );

            return (
              <label
                key={emp._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  cursor: isAlreadyEnrolled ? 'default' : 'pointer',
                  opacity: isAlreadyEnrolled ? 0.6 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    disabled={isAlreadyEnrolled}
                    checked={isAlreadyEnrolled || selectedEmployeeIds.includes(emp._id)}
                    onChange={() => toggleAssignEmployee(emp._id)}
                  />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{emp.fullName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {emp.department} • {emp.designation}
                    </div>
                  </div>
                </div>

                {isAlreadyEnrolled && (
                  <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                    Enrolled
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </Modal>

      {/* Update Progress Modal */}
      <Modal
        isOpen={progressModalOpen}
        onClose={() => setProgressModalOpen(false)}
        title="Update Course Completion Progress"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setProgressModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={submitProgress}>
              Save Progress
            </button>
          </>
        }
      >
        <div style={{ padding: '10px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Completion Level:</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-light)' }}>
              {progressValue}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={progressValue}
            onChange={(e) => setProgressValue(Number(e.target.value))}
            style={{ width: '100%', marginBottom: '16px' }}
          />

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            {[25, 50, 75, 100].map((val) => (
              <button
                key={val}
                className="btn btn-outline btn-sm"
                onClick={() => setProgressValue(val)}
              >
                {val}% {val === 100 && '✓'}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
