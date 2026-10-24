import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import {
  Clock,
  CheckCircle2,
  Calendar,
  Filter,
  MapPin,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  Building2,
} from 'lucide-react';

export const AttendanceTracker = () => {
  const { role, employee, showToast } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [attendanceData, setAttendanceData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [myAttendance, setMyAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  // Digital Punch Widget
  const [punchLocation, setPunchLocation] = useState('Office');
  const [punching, setPunching] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      if (role === 'employee') {
        const res = await api.attendance.getMyAttendance();
        if (res.success) {
          setMyAttendance(res);
        }
      } else {
        const res = await api.attendance.getAll({
          date: selectedDate,
          department: selectedDept,
          status: selectedStatus,
        });
        if (res.success) {
          setAttendanceData(res.records);
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
    loadData();
  }, [selectedDate, selectedDept, selectedStatus, role]);

  const handlePunch = async (action) => {
    try {
      setPunching(true);
      const res = await api.attendance.punch({
        action,
        location: punchLocation,
        notes: `Punched from portal`,
      });
      if (res.success) {
        showToast(res.message, 'success');
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'warning');
    } finally {
      setPunching(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">
            <Clock size={28} style={{ color: '#38bdf8' }} />
            <span>Attendance Tracking & Logs</span>
          </div>
          <div className="page-subtitle">
            {role === 'employee'
              ? 'Record daily check-in/out, monitor punctuality rates, and log work hours'
              : 'Real-time company-wide attendance monitoring, punctuality analysis, and daily reporting'}
          </div>
        </div>

        {/* Date Selector for HR/Manager */}
        {role !== 'employee' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Log Date:</span>
            <input
              type="date"
              className="input-field"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: 'auto', padding: '8px 12px' }}
            />
          </div>
        )}
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        {role === 'employee' ? (
          <>
            <StatCard
              title="Attendance Rate"
              value={`${myAttendance?.stats?.attendanceRate || 0}%`}
              icon={TrendingUp}
              color="success"
              subtext="Historical punctuality score"
            />
            <StatCard
              title="Present Days Logged"
              value={myAttendance?.stats?.presentDays || 0}
              icon={CheckCircle2}
              color="primary"
              subtext="Successful check-ins"
            />
            <StatCard
              title="Late Arrivals"
              value={myAttendance?.stats?.lateDays || 0}
              icon={AlertTriangle}
              color="warning"
              subtext="Punched after 09:30 AM"
            />
            <StatCard
              title="Average Daily Hours"
              value={`${myAttendance?.stats?.averageHours || 0}h`}
              icon={Clock}
              color="secondary"
              subtext="Productive recorded hours"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Workforce Attendance"
              value={`${summary?.attendanceRate || 0}%`}
              icon={TrendingUp}
              color="success"
              badge={`${summary?.presentCount || 0} Present`}
              subtext={`Out of ${summary?.totalEmployees || 0} active employees`}
            />
            <StatCard
              title="On Time Check-Ins"
              value={Math.max(0, (summary?.presentCount || 0) - (summary?.lateCount || 0))}
              icon={CheckCircle2}
              color="primary"
              subtext="Checked in before 09:30 AM"
            />
            <StatCard
              title="Late Arrivals"
              value={summary?.lateCount || 0}
              icon={AlertTriangle}
              color="warning"
              subtext="Delayed check-ins logged"
            />
            <StatCard
              title="Absent / Unmarked"
              value={summary?.absentCount || 0}
              icon={Clock}
              color="danger"
              subtext="No punch record for selected date"
            />
          </>
        )}
      </div>

      {/* Employee Digital Punch Widget (shown on top for employee) */}
      {role === 'employee' && (
        <div
          className="punch-card"
          style={{ marginBottom: '28px', maxWidth: '680px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} style={{ color: 'var(--primary-light)' }} />
              <h3 style={{ fontSize: '1.1rem' }}>Punch Daily Attendance</h3>
            </div>
            <span className="badge badge-purple">
              <MapPin size={12} /> {punchLocation}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            {['Office', 'Remote', 'Hybrid'].map((loc) => (
              <button
                key={loc}
                className={`btn btn-sm ${punchLocation === loc ? 'btn-secondary' : 'btn-outline'}`}
                style={{ flex: 1, borderColor: punchLocation === loc ? 'var(--primary-light)' : undefined }}
                onClick={() => setPunchLocation(loc)}
                disabled={myAttendance?.today?.checkOut}
              >
                {loc}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              className="btn btn-success"
              onClick={() => handlePunch('check-in')}
              disabled={punching || !!myAttendance?.today?.checkIn}
            >
              <CheckCircle2 size={16} />
              <span>{myAttendance?.today?.checkIn ? 'Already Checked In' : 'Punch In'}</span>
            </button>
            <button
              className="btn btn-danger"
              onClick={() => handlePunch('check-out')}
              disabled={punching || !myAttendance?.today?.checkIn || !!myAttendance?.today?.checkOut}
            >
              <Clock size={16} />
              <span>{myAttendance?.today?.checkOut ? 'Already Checked Out' : 'Punch Out'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter Toolbar for Admin/HR */}
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
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            style={{ width: 'auto', padding: '8px 12px' }}
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Product & Design">Product & Design</option>
            <option value="Finance & Operations">Finance & Operations</option>
          </select>

          <select
            className="select-field"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ width: 'auto', padding: '8px 12px' }}
          >
            <option value="All">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Half-day">Half-day</option>
          </select>
        </div>
      )}

      {/* Attendance Logs Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>
          {role === 'employee' ? 'My Recent Attendance History' : `Attendance Logs for ${selectedDate}`}
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            Loading attendance records...
          </div>
        ) : (role === 'employee' ? myAttendance?.records?.length === 0 : attendanceData.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No attendance records found for this period.
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {role !== 'employee' && <th>Employee</th>}
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Work Hours</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {(role === 'employee' ? myAttendance?.records : attendanceData).map((rec) => (
                  <tr key={rec._id}>
                    {role !== 'employee' && (
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {rec.employee?.firstName} {rec.employee?.lastName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {rec.employee?.employeeId} • {rec.employee?.department}
                        </div>
                      </td>
                    )}
                    <td style={{ fontWeight: 500 }}>{rec.date}</td>
                    <td>
                      {rec.checkIn
                        ? new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </td>
                    <td>
                      {rec.checkOut
                        ? new Date(rec.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Active'}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {rec.workHours ? `${rec.workHours} hrs` : 'In Progress'}
                    </td>
                    <td>
                      <span className="badge badge-neutral">{rec.location}</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          rec.status === 'Present'
                            ? 'badge-success'
                            : rec.status === 'Late'
                            ? 'badge-warning'
                            : 'badge-info'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {rec.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
