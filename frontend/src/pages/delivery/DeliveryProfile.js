import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiEdit3, FiLock, FiMail, FiMapPin, FiPhone, FiSave, FiUser } from 'react-icons/fi';
import Spinner from '../../components/Spinner';
import { useAuth } from '../../context/AuthContext';

const API = 'http://localhost:5000/api';

export default function DeliveryProfile() {
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    password: ''
  });

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API}/delivery/auth/me`, getHeaders());
      const user = res.data?.user || {};
      setProfile((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || '',
        password: ''
      }));
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: profile.name,
        phone: profile.phone,
        city: profile.city
      };
      if (profile.password.trim()) {
        payload.password = profile.password.trim();
      }

      const res = await axios.put(`${API}/delivery/auth/profile`, payload, getHeaders());
      const updatedUser = res.data?.user;
      if (updatedUser) {
        updateUser(updatedUser);
      }

      setProfile((prev) => ({ ...prev, password: '' }));
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: 760 }}>
        <div className="profile-header-card">
          <div className="profile-avatar-large">
            {profile.name ? profile.name.slice(0, 1).toUpperCase() : 'D'}
          </div>
          <div className="profile-header-info">
            <h2 className="fw-bold mb-1">{profile.name || 'Delivery Partner'}</h2>
            <p className="text-muted mb-0">{profile.email}</p>
            {profile.city && (
              <p className="mb-0" style={{ fontSize: '0.88rem', color: '#64748b' }}>
                <FiMapPin size={13} /> {profile.city}
              </p>
            )}
          </div>
          <button
            className={`btn-edit-profile ${editing ? 'active' : ''}`}
            onClick={() => setEditing((v) => !v)}
          >
            <FiEdit3 size={16} /> {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="dashboard-section">
            <div className="dashboard-section-header">
              <h5><FiUser className="me-2" /> Delivery Profile</h5>
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Full Name</label>
                <div className="profile-input-group">
                  <FiUser className="profile-input-icon" />
                  <input
                    type="text"
                    className="form-control profile-input"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    disabled={!editing}
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Email</label>
                <div className="profile-input-group">
                  <FiMail className="profile-input-icon" />
                  <input
                    type="email"
                    className="form-control profile-input"
                    value={profile.email}
                    disabled
                    style={{ opacity: 0.6 }}
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Phone</label>
                <div className="profile-input-group">
                  <FiPhone className="profile-input-icon" />
                  <input
                    type="tel"
                    className="form-control profile-input"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    disabled={!editing}
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>City</label>
                <div className="profile-input-group">
                  <FiMapPin className="profile-input-icon" />
                  <input
                    type="text"
                    className="form-control profile-input"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    disabled={!editing}
                    required
                  />
                </div>
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                  New Password (Optional)
                </label>
                <div className="profile-input-group">
                  <FiLock className="profile-input-icon" />
                  <input
                    type="password"
                    className="form-control profile-input"
                    placeholder="Leave blank to keep current password"
                    value={profile.password}
                    onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                    disabled={!editing}
                  />
                </div>
                {editing && (
                  <small className="text-muted">Minimum 6 characters if changing password.</small>
                )}
              </div>
            </div>
          </div>

          {editing && (
            <div className="text-end mb-4">
              <button type="submit" className="btn-save-profile" disabled={saving}>
                <FiSave className="me-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
