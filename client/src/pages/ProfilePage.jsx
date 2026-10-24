import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  DollarSign,
  Shield,
  MapPin,
  Heart,
  Edit2,
  Save,
  CheckCircle2,
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, employee, showToast } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable Profile fields
  const [profileData, setProfileData] = useState({
    phone: '',
    address: { street: '', city: '', state: '', zip: '' },
    emergencyContact: { name: '', relationship: '', phone: '' },
    skills: '',
  });

  useEffect(() => {
    if (employee) {
      setProfileData({
        phone: employee.phone || '',
        address: {
          street: employee.address?.street || '',
          city: employee.address?.city || '',
          state: employee.address?.state || '',
          zip: employee.address?.zip || '',
        },
        emergencyContact: {
          name: employee.emergencyContact?.name || '',
          relationship: employee.emergencyContact?.relationship || '',
          phone: employee.emergencyContact?.phone || '',
        },
        skills: employee.skills ? employee.skills.join(', ') : '',
      });
    }
  }, [employee]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!employee) return;
    try {
      setSaving(true);
      const res = await api.employees.update(employee._id, {
        phone: profileData.phone,
        address: profileData.address,
        emergencyContact: profileData.emergencyContact,
        skills: profileData.skills,
      });
      if (res.success) {
        showToast('Personal profile records updated successfully!', 'success');
        setIsEditing(false);
      }
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">
            <User size={28} style={{ color: 'var(--primary-light)' }} />
            <span>Personal Profile & Official Records</span>
          </div>
          <div className="page-subtitle">
            Maintain your personal records, contact coordinates, emergency contacts, and skill credentials
          </div>
        </div>

        <button
          className={`btn ${isEditing ? 'btn-outline' : 'btn-primary'}`}
          onClick={() => setIsEditing(!isEditing)}
        >
          <Edit2 size={16} />
          <span>{isEditing ? 'Cancel Editing' : 'Edit Personal Info'}</span>
        </button>
      </div>

      {/* Main Profile Grid */}
      <div className="two-col-grid" style={{ gap: '28px' }}>
        {/* Left Column: Official Employment Records (Read-Only) */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '24px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.5rem',
                color: '#fff',
                boxShadow: '0 8px 24px var(--primary-glow)',
              }}
            >
              {employee ? `${employee.firstName[0]}${employee.lastName[0]}` : 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                {employee?.fullName || user?.email}
              </h2>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
                {employee?.designation}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <span className={`role-badge role-badge-${user?.role}`}>{user?.role}</span>
                <span className={`badge ${employee?.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                  {employee?.status || 'Active'}
                </span>
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', marginBottom: '16px', color: 'var(--text-primary)' }}>
            Corporate Employment Details
          </h3>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              padding: '18px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.88rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Employee ID:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{employee?.employeeId}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Corporate Email:</span>
              <strong>{employee?.email}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Department:</span>
              <strong>{employee?.department}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Reporting Manager:</span>
              <strong>
                {employee?.manager
                  ? `${employee.manager.firstName} ${employee.manager.lastName} (${employee.manager.designation})`
                  : 'Executive Leadership'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Date of Joining:</span>
              <strong>{new Date(employee?.dateOfJoining || Date.now()).toLocaleDateString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Annual Compensation:</span>
              <strong style={{ color: 'var(--success)' }}>
                ${employee?.salary?.toLocaleString()} / year
              </strong>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Contact & Emergency Info */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '6px' }}>
            Personal Contacts & Coordinates
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Update your mobile contact, residential address, emergency point of contact, and skills.
          </p>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="input-field"
                disabled={!isEditing}
                placeholder="+1 (555) 000-0000"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} style={{ color: 'var(--secondary)' }} />
                Residential Address
              </label>
              <input
                type="text"
                className="input-field"
                style={{ marginBottom: '8px' }}
                disabled={!isEditing}
                placeholder="Street Address (e.g. 789 Mission St)"
                value={profileData.address.street}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    address: { ...profileData.address, street: e.target.value },
                  })
                }
              />
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px' }}>
                <input
                  type="text"
                  className="input-field"
                  disabled={!isEditing}
                  placeholder="City"
                  value={profileData.address.city}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      address: { ...profileData.address, city: e.target.value },
                    })
                  }
                />
                <input
                  type="text"
                  className="input-field"
                  disabled={!isEditing}
                  placeholder="State"
                  value={profileData.address.state}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      address: { ...profileData.address, state: e.target.value },
                    })
                  }
                />
                <input
                  type="text"
                  className="input-field"
                  disabled={!isEditing}
                  placeholder="ZIP"
                  value={profileData.address.zip}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      address: { ...profileData.address, zip: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Heart size={14} style={{ color: 'var(--danger)' }} />
                Emergency Contact Person
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  className="input-field"
                  disabled={!isEditing}
                  placeholder="Contact Name (e.g. Elena Rivera)"
                  value={profileData.emergencyContact.name}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      emergencyContact: { ...profileData.emergencyContact, name: e.target.value },
                    })
                  }
                />
                <input
                  type="text"
                  className="input-field"
                  disabled={!isEditing}
                  placeholder="Relationship (e.g. Mother / Spouse)"
                  value={profileData.emergencyContact.relationship}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      emergencyContact: {
                        ...profileData.emergencyContact,
                        relationship: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <input
                type="text"
                className="input-field"
                disabled={!isEditing}
                placeholder="Emergency Phone Number"
                value={profileData.emergencyContact.phone}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    emergencyContact: { ...profileData.emergencyContact, phone: e.target.value },
                  })
                }
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Professional Skills (Comma-separated)</label>
              <input
                type="text"
                className="input-field"
                disabled={!isEditing}
                placeholder="e.g. React, Node.js, MongoDB, Docker"
                value={profileData.skills}
                onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
              />
            </div>

            {isEditing && (
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                style={{ width: '100%', padding: '12px' }}
              >
                <Save size={16} />
                <span>{saving ? 'Saving Records...' : 'Save Profile Changes'}</span>
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
