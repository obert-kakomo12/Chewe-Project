import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, Award, ShieldAlert, Plus, X, Trash2, Edit, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from './config';

const ExecutiveOperations = () => {
  const [activeTab, setActiveTab] = useState('staff-roster');
  const [staff, setStaff] = useState([]);
  const [pipeline, setPipeline] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classRooms, setClassRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals & Forms
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [newStaffData, setNewStaffData] = useState({ name: '', email: '', role: 'Teacher', password: '' });
  const [newSubject, setNewSubject] = useState({ name: '', code: '', level: 'O-Level', stream: 'Sciences' });
  const [newClass, setNewClass] = useState({ name: '', grade_level: 'Form 1' });
  
  // Sponsorship Review modal states
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewProfileData, setReviewProfileData] = useState(null);
  const [editBeamStatus, setEditBeamStatus] = useState('Eligible');
  const [editFinancialNeed, setEditFinancialNeed] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [isSubmittingStaff, setIsSubmittingStaff] = useState(false);
  const [isSubmittingSubject, setIsSubmittingSubject] = useState(false);
  const [isSubmittingClass, setIsSubmittingClass] = useState(false);

  const fetchStaffData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const staffRes = await fetch(`${API_BASE_URL}/users/staff`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (staffRes.ok) setStaff(await staffRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const [staffRes, pipeRes, subjRes, classRes] = await Promise.all([
          fetch(`${API_BASE_URL}/users/staff`, { headers }),
          fetch(`${API_BASE_URL}/welfare/sponsorship-pipeline`, { headers }),
          fetch(`${API_BASE_URL}/academics/subjects`, { headers }),
          fetch(`${API_BASE_URL}/academics/classrooms`, { headers })
        ]);

        if (staffRes.ok) setStaff(await staffRes.json());
        if (pipeRes.ok) setPipeline(await pipeRes.json());
        if (subjRes.ok) setSubjects(await subjRes.json());
        if (classRes.ok) setClassRooms(await classRes.json());
      } catch (err) {
        console.error('Failed to fetch executive ops data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (isSubmittingStaff) return;
    setIsSubmittingStaff(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newStaffData)
      });
      if (res.ok) {
        setIsAddStaffModalOpen(false);
        setNewStaffData({ name: '', email: '', role: 'Teacher', password: '' });
        fetchStaffData();
      } else {
        const errorData = await res.json();
        alert(`Failed: ${errorData.message}`);
      }
    } catch (err) {
      alert('Failed to add staff');
    } finally {
      setIsSubmittingStaff(false);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (isSubmittingSubject) return;
    setIsSubmittingSubject(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/academics/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newSubject)
      });
      if (res.ok) {
        setNewSubject({ name: '', code: '', level: 'O-Level', stream: 'Sciences' });
        const fresh = await fetch(`${API_BASE_URL}/academics/subjects`, { headers: { 'Authorization': `Bearer ${token}` } });
        setSubjects(await fresh.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingSubject(false);
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    if (isSubmittingClass) return;
    setIsSubmittingClass(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/academics/classrooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newClass)
      });
      if (res.ok) {
        setNewClass({ name: '', grade_level: 'Form 1' });
        const fresh = await fetch(`${API_BASE_URL}/academics/classrooms`, { headers: { 'Authorization': `Bearer ${token}` } });
        setClassRooms(await fresh.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingClass(false);
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchStaffData();
      else alert('Failed to delete staff');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm("Delete this subject?")) return;
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/academics/subjects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const fresh = await fetch(`${API_BASE_URL}/academics/subjects`, { headers: { 'Authorization': `Bearer ${token}` } });
        setSubjects(await fresh.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm("Delete this classroom?")) return;
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/academics/classrooms/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const fresh = await fetch(`${API_BASE_URL}/academics/classrooms`, { headers: { 'Authorization': `Bearer ${token}` } });
        setClassRooms(await fresh.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewProfile = (profile) => {
    setReviewProfileData(profile);
    setEditBeamStatus(profile.beam_status || 'Eligible');
    setEditFinancialNeed(profile.financial_need_flag || false);
    setIsReviewModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (updatingProfile) return;
    setUpdatingProfile(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/welfare/profile/${reviewProfileData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          beam_status: editBeamStatus,
          financial_need_flag: editFinancialNeed
        })
      });
      if (res.ok) {
        setIsReviewModalOpen(false);
        const fresh = await fetch(`${API_BASE_URL}/welfare/sponsorship-pipeline`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (fresh.ok) setPipeline(await fresh.json());
      } else {
        alert('Failed to update welfare profile.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while updating profile.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  if (loading) {
    return <div className="content-area" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>Loading...</div>;
  }

  // Premium Tab Button Component
  const TabBtn = ({ label, active, onClick }) => (
    <button onClick={onClick} style={{
      background: active ? 'var(--accent-blue)' : '#ffffff',
      color: active ? '#ffffff' : 'var(--text-secondary)',
      border: '1.5px solid var(--border-color)',
      padding: '8px 16px',
      borderRadius: '7px',
      fontWeight: 600,
      fontSize: '0.82rem',
      cursor: 'pointer',
      transition: 'all 0.15s ease'
    }}>
      {label}
    </button>
  );

  return (
    <div className="content-area animate-fade-in" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <TabBtn label="Staff Roster" active={activeTab === 'staff-roster'} onClick={() => setActiveTab('staff-roster')} />
        <TabBtn label="Class & Subject Builder" active={activeTab === 'class-builder'} onClick={() => setActiveTab('class-builder')} />
        <TabBtn label="Sponsorship Pipeline" active={activeTab === 'sponsorship'} onClick={() => setActiveTab('sponsorship')} />
      </div>

      <div className="glass-panel hover-lift" style={{ padding: '24px' }}>
        {activeTab === 'staff-roster' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'rgba(59,130,246,0.1)', padding: '10px', borderRadius: '8px', color: '#3b82f6' }}><Users size={20} /></div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0d1f45', margin: 0 }}>Executive Staff Roster</h3>
              </div>
              <button className="primary-button" onClick={() => setIsAddStaffModalOpen(true)}>
                <Plus size={16} /> Add Staff
              </button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Account Status</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {staff.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center' }}>No staff found.</td></tr>
                ) : (
                  staff.map(s => (
                    <tr key={s.id}>
                      <td data-label="Name" style={{ fontWeight: 600 }}>{s.name}</td>
                      <td data-label="Email">{s.email}</td>
                      <td data-label="Role"><span style={{ padding: '2px 8px', borderRadius: '10px', background: '#e0e7ff', color: '#4338ca', fontSize: '0.75rem', fontWeight: 600 }}>{s.role}</span></td>
                      <td data-label="Account Status" style={{ color: 'var(--status-success)', fontWeight: 600 }}>Active</td>
                      <td data-label="Action">
                        <button className="icon-button" style={{ color: 'var(--status-danger)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => handleDeleteStaff(s.id)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'class-builder' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(16,185,129,0.1)', padding: '10px', borderRadius: '8px', color: '#10b981' }}><GraduationCap size={20} /></div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0d1f45', margin: 0 }}>Class & Subject Builder</h3>
            </div>
            
            <div className="dashboard-row" style={{ gap: '24px' }}>
              {/* Subjects */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#0d1f45', fontWeight: 600 }}>Master Subjects</h4>
                <form onSubmit={handleAddSubject} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                  <input type="text" className="mark-input" placeholder="Name (e.g. Maths)" value={newSubject.name} onChange={e => setNewSubject({...newSubject, name: e.target.value})} required style={{ flex: 1, minWidth: '120px', textAlign: 'left' }} />
                  <input type="text" className="mark-input" placeholder="Code" value={newSubject.code} onChange={e => setNewSubject({...newSubject, code: e.target.value})} required style={{ width: '80px', textAlign: 'left' }} />
                  <select className="premium-select" style={{ minWidth: '100px' }} value={newSubject.level} onChange={e => setNewSubject({...newSubject, level: e.target.value})}>
                    <option>O-Level</option><option>A-Level</option>
                  </select>
                  <select className="premium-select" style={{ minWidth: '110px' }} value={newSubject.stream} onChange={e => setNewSubject({...newSubject, stream: e.target.value})}>
                    <option>Sciences</option><option>Commercials</option><option>Arts</option><option>General</option>
                  </select>
                  <button type="submit" className="primary-button" disabled={isSubmittingSubject}>
                    {isSubmittingSubject ? 'Saving...' : <Plus size={16} />}
                  </button>
                </form>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <table className="data-table">
                    <thead><tr><th>Name</th><th>Stream</th><th>Level</th><th style={{ width: '40px' }}></th></tr></thead>
                    <tbody>
                      {subjects.length === 0 ? <tr><td colSpan="4">No subjects defined.</td></tr> : subjects.map(s => (
                        <tr key={s.id}>
                          <td data-label="Name" style={{ fontWeight: 600 }}>{s.name} ({s.code})</td>
                          <td data-label="Stream">{s.stream}</td>
                          <td data-label="Level">{s.level}</td>
                          <td data-label="Action">
                            <button className="icon-button" style={{ color: 'var(--status-danger)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => handleDeleteSubject(s.id)}>
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Classes */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#0d1f45', fontWeight: 600 }}>School ClassRooms</h4>
                <form onSubmit={handleAddClass} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <input type="text" className="mark-input" placeholder="Class Name (e.g. Form 1 East)" value={newClass.name} onChange={e => setNewClass({...newClass, name: e.target.value})} required style={{ flex: 1, textAlign: 'left' }} />
                  <select className="premium-select" style={{ minWidth: '100px' }} value={newClass.grade_level} onChange={e => setNewClass({...newClass, grade_level: e.target.value})}>
                    <option>Form 1</option><option>Form 2</option><option>Form 3</option><option>Form 4</option><option>Form 5</option><option>Form 6</option>
                  </select>
                  <button type="submit" className="primary-button" disabled={isSubmittingClass}>
                    {isSubmittingClass ? 'Saving...' : <Plus size={16} />}
                  </button>
                </form>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <table className="data-table">
                    <thead><tr><th>Class Name</th><th>Level</th><th style={{ width: '40px' }}></th></tr></thead>
                    <tbody>
                      {classRooms.length === 0 ? <tr><td colSpan="3">No classrooms defined.</td></tr> : classRooms.map(c => (
                        <tr key={c.id}>
                          <td data-label="Class Name" style={{ fontWeight: 600 }}>{c.name}</td>
                          <td data-label="Level">{c.grade_level}</td>
                          <td data-label="Action">
                            <button className="icon-button" style={{ color: 'var(--status-danger)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => handleDeleteClass(c.id)}>
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sponsorship' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(245,158,11,0.1)', padding: '10px', borderRadius: '8px', color: '#f59e0b' }}><Award size={20} /></div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0d1f45', margin: 0 }}>Sponsorship & Bursary Pipeline</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.85rem' }}>Auto-generated list of high-potential students (Confidence Index ≥ 75) who require financial assistance.</p>
            
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Confidence Index</th>
                  <th>BEAM Status</th>
                  <th>Flag</th>
                  <th style={{ width: '120px' }}></th>
                </tr>
              </thead>
              <tbody>
                {pipeline.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center' }}>No candidates meet the criteria currently.</td></tr>
                ) : (
                  pipeline.map(p => (
                    <tr key={p.id || Math.random()}>
                      <td data-label="Student Name" style={{ fontWeight: 600 }}>{p.student?.name || 'Unknown Student'}</td>
                      <td data-label="Confidence Index">
                        <span style={{ color: 'var(--status-success)', fontWeight: 700 }}>{p.confidence_index} / 100</span>
                      </td>
                      <td data-label="BEAM Status">{p.beam_status || 'N/A'}</td>
                      <td data-label="Flag">
                        {p.financial_need_flag && <span style={{ color: '#ef4444', background: '#fef2f2', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600 }}>Financial Need</span>}
                      </td>
                      <td data-label="Action" style={{ textAlign: 'right' }}>
                        <button className="secondary-button" style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                          onClick={() => handleReviewProfile(p)}>
                          Review Profile
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {isAddStaffModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddStaffModalOpen(false)}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', background: '#fff' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Add New Staff</h3>
              <button className="icon-button" style={{ color: 'var(--text-secondary)' }} onClick={() => setIsAddStaffModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddStaff} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 500 }}>Full Name</label>
                <input type="text" className="mark-input" style={{ width: '100%', textAlign: 'left' }}
                  value={newStaffData.name} onChange={e => setNewStaffData({...newStaffData, name: e.target.value})} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 500 }}>Email Address</label>
                <input type="email" className="mark-input" style={{ width: '100%', textAlign: 'left' }}
                  value={newStaffData.email} onChange={e => setNewStaffData({...newStaffData, email: e.target.value})} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 500 }}>Role</label>
                <select className="premium-select" style={{ width: '100%' }} value={newStaffData.role} onChange={e => setNewStaffData({...newStaffData, role: e.target.value})}>
                  <option value="Teacher">Teacher</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 500 }}>Temporary Password</label>
                <input type="text" className="mark-input" style={{ width: '100%', textAlign: 'left' }}
                  value={newStaffData.password} onChange={e => setNewStaffData({...newStaffData, password: e.target.value})} placeholder="Default: password123" />
              </div>
              <button type="submit" className="primary-button" style={{ marginTop: '10px', justifyContent: 'center' }} disabled={isSubmittingStaff}>
                {isSubmittingStaff ? 'Creating...' : 'Create Staff Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Review Sponsorship Modal */}
      {isReviewModalOpen && reviewProfileData && (
        <div className="modal-overlay" onClick={() => setIsReviewModalOpen(false)}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '450px', background: '#fff', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700 }}>Review Sponsorship Profile</h3>
              <button className="icon-button" style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setIsReviewModalOpen(false)}><X size={20} /></button>
            </div>
            
            <div style={{ marginBottom: '20px', background: '#f8fafc', padding: '14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>Student Name</span>
                <strong style={{ color: 'var(--text-primary)' }}>{reviewProfileData.student?.name || 'Unknown'}</strong>
              </div>
              <div style={{ marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>Email</span>
                <span style={{ color: 'var(--text-secondary)' }}>{reviewProfileData.student?.email || 'N/A'}</span>
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>AI Confidence Index</span>
                <strong style={{ color: 'var(--status-success)' }}>{reviewProfileData.confidence_index} / 100</strong>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>BEAM Status</label>
                <select className="premium-select" style={{ width: '100%' }} value={editBeamStatus} onChange={e => setEditBeamStatus(e.target.value)}>
                  <option value="Eligible">Eligible</option>
                  <option value="Approved">Approved</option>
                  <option value="Applied">Applied</option>
                  <option value="Not Eligible">Not Eligible</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fffbeb', border: '1px solid #fde68a', padding: '12px', borderRadius: '6px' }}>
                <input type="checkbox" id="financial-need-check" checked={editFinancialNeed} onChange={e => setEditFinancialNeed(e.target.checked)} style={{ width: '17px', height: '17px', accentColor: 'var(--status-danger)', cursor: 'pointer' }} />
                <label htmlFor="financial-need-check" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#92400e', cursor: 'pointer' }}>
                  Flag as Urgent Financial Need
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="secondary-button" onClick={() => setIsReviewModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={updatingProfile}>
                  {updatingProfile ? 'Saving...' : 'Save Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutiveOperations;
