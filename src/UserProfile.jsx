import React, { useState, useEffect } from 'react';
import { User, Lock, Save, Camera, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from './config';

const UserProfile = ({ setGlobalProfilePic }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setProfile(data);
      setName(data.name);
      setProfilePicture(data.profile_picture || '');
      setLoading(false);
      if (data.profile_picture && setGlobalProfilePic) {
        setGlobalProfilePic(data.profile_picture);
      }
    } catch (err) {
      console.error(err);
      setError('Could not load profile details.');
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ name, profilePicture })
      });
      if (!res.ok) throw new Error('Failed to update profile');
      setSuccessMsg('Profile updated successfully!');
      if (setGlobalProfilePic) setGlobalProfilePic(profilePicture);
    } catch (err) {
      setError(err.message);
    }
    setSavingProfile(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match!');
      return;
    }
    setSavingPassword(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/users/me/password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update password');
      }
      setSuccessMsg('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message);
    }
    setSavingPassword(false);
  };

  if (loading) {
    return (
      <div className="content-area" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <RefreshCw className="animate-spin" style={{ color: 'var(--accent-blue)', animation: 'spin 1s linear infinite' }} size={32} />
      </div>
    );
  }

  return (
    <div className="content-area animate-fade-in" style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: '800px', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div className="page-header-bar">
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>My Profile</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Manage your personal details and security settings.</p>
          </div>
        </div>

        {error && (
          <div style={{ background: '#fffbeb', borderLeft: '4px solid var(--status-warning)', padding: '12px 16px', borderRadius: '4px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <AlertCircle size={18} color="var(--status-warning)" />
            <span style={{ fontSize: '0.85rem', color: '#92400e' }}>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{ background: '#f0fdf4', borderLeft: '4px solid var(--status-success)', padding: '12px 16px', borderRadius: '4px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <CheckCircle size={18} color="var(--status-success)" />
            <span style={{ fontSize: '0.85rem', color: '#065f46' }}>{successMsg}</span>
          </div>
        )}

        <div className="dashboard-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
          
          {/* Profile Details Form */}
          <div className="glass-panel hover-lift">
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><User size={18} /> Public Profile</h3>
            
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{ position: 'relative' }}>
                  {profilePicture ? (
                    <img src={profilePicture} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #e4ecf5' }} />
                  ) : (
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--accent-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, border: '3px solid #e4ecf5' }}>
                      {profile?.name?.substring(0, 2).toUpperCase() || 'U'}
                    </div>
                  )}
                  <label htmlFor="avatar-upload" style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '6px', borderRadius: '50%', cursor: 'pointer', display: 'flex', boxShadow: 'var(--shadow-sm)' }}>
                    <Camera size={15} color="var(--text-secondary)" />
                  </label>
                  <input id="avatar-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click camera icon to upload (Max 2MB)</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Full Name</label>
                <input type="text" className="search-bar input" style={{ width: '100%' }} value={name} onChange={e => setName(e.target.value)} required />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Email Address</label>
                <input type="email" className="search-bar input" style={{ width: '100%', background: '#f8fafc', color: 'var(--text-muted)' }} value={profile?.email || ''} readOnly />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>Email cannot be changed directly. Contact admin.</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="submit" className="primary-button" disabled={savingProfile}>
                  <Save size={16} /> {savingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>

          {/* Password Update Form */}
          <div className="glass-panel hover-lift">
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Lock size={18} /> Security Settings</h3>
            
            <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Current Password</label>
                <input type="password" className="search-bar input" style={{ width: '100%' }} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>New Password</label>
                <input type="password" className="search-bar input" style={{ width: '100%' }} value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Confirm New Password</label>
                <input type="password" className="search-bar input" style={{ width: '100%' }} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="submit" className="primary-button" disabled={savingPassword} style={{ background: 'var(--status-danger)' }}>
                  <Lock size={16} /> {savingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserProfile;
