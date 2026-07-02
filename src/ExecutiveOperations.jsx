import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, Award, ShieldAlert, Plus, X, Trash2 } from 'lucide-react';
import { API_BASE_URL } from './config';

const ExecutiveOperations = () => {
  const [activeTab, setActiveTab] = useState('staff-roster');
  const [staff, setStaff] = useState([]);
  const [pipeline, setPipeline] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classRooms, setClassRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [newStaffData, setNewStaffData] = useState({ name: '', email: '', role: 'Teacher', password: '' });
  
  const [newSubject, setNewSubject] = useState({ name: '', code: '', level: 'O-Level', stream: 'Sciences' });
  const [newClass, setNewClass] = useState({ name: '', grade_level: 'Form 1' });
  
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

  if (loading) {
    return <div className="content-area" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>Loading...</div>;
  }

  return (
    <div className="content-area animate-fade-in" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('staff-roster')} style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 500, background: activeTab === 'staff-roster' ? 'var(--accent-blue)' : '#e5e7eb', color: activeTab === 'staff-roster' ? '#fff' : 'var(--text-secondary)' }}>
          Staff Roster
        </button>
        <button onClick={() => setActiveTab('class-builder')} style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 500, background: activeTab === 'class-builder' ? 'var(--accent-blue)' : '#e5e7eb', color: activeTab === 'class-builder' ? '#fff' : 'var(--text-secondary)' }}>
          Class & Subject Builder
        </button>
        <button onClick={() => setActiveTab('sponsorship')} style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 500, background: activeTab === 'sponsorship' ? 'var(--accent-blue)' : '#e5e7eb', color: activeTab === 'sponsorship' ? '#fff' : 'var(--text-secondary)' }}>
          Sponsorship Pipeline
        </button>
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
                        <button className="icon-button" style={{ color: 'var(--status-danger)' }} onClick={() => handleDeleteStaff(s.id)}>
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
                <h4 style={{ margin: '0 0 16px 0', color: '#0d1f45' }}>Master Subjects</h4>
                <form onSubmit={handleAddSubject} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                  <input type="text" className="mark-input" placeholder="Name (e.g. Maths)" value={newSubject.name} onChange={e => setNewSubject({...newSubject, name: e.target.value})} required style={{ flex: 1, minWidth: '120px' }} />
                  <input type="text" className="mark-input" placeholder="Code" value={newSubject.code} onChange={e => setNewSubject({...newSubject, code: e.target.value})} required style={{ width: '80px' }} />
                  <select className="premium-select" value={newSubject.level} onChange={e => setNewSubject({...newSubject, level: e.target.value})}>
                    <option>O-Level</option><option>A-Level</option>
                  </select>
                  <select className="premium-select" value={newSubject.stream} onChange={e => setNewSubject({...newSubject, stream: e.target.value})}>
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
                          <td data-label="Name">{s.name} ({s.code})</td>
                          <td data-label="Stream">{s.stream}</td>
                          <td data-label="Level">{s.level}</td>
                          <td data-label="Action">
                            <button className="icon-button" style={{ color: 'var(--status-danger)' }} onClick={() => handleDeleteSubject(s.id)}>
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
                <h4 style={{ margin: '0 0 16px 0', color: '#0d1f45' }}>School ClassRooms</h4>
                <form onSubmit={handleAddClass} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <input type="text" className="mark-input" placeholder="Class Name (e.g. Form 1 East)" value={newClass.name} onChange={e => setNewClass({...newClass, name: e.target.value})} required style={{ flex: 1 }} />
                  <select className="premium-select" value={newClass.grade_level} onChange={e => setNewClass({...newClass, grade_level: e.target.value})}>
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
                          <td data-label="Class Name">{c.name}</td>
                          <td data-label="Level">{c.grade_level}</td>
                          <td data-label="Action">
                            <button className="icon-button" style={{ color: 'var(--status-danger)' }} onClick={() => handleDeleteClass(c.id)}>
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
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Auto-generated list of high-potential students (Confidence Index ≥ 75) who require financial assistance.</p>
            
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Confidence Index</th>
                  <th>BEAM Status</th>
                  <th>Flag</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pipeline.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center' }}>No candidates meet the criteria currently.</td></tr>
                ) : (
                  pipeline.map(p => (
                    <tr key={p.student?.id || Math.random()}>
                      <td data-label="Student Name" style={{ fontWeight: 600 }}>{p.student?.name || 'Unknown Student'}</td>
                      <td data-label="Confidence Index">
                        <span style={{ color: 'var(--status-success)', fontWeight: 700 }}>{p.confidence_index} / 100</span>
                      </td>
                      <td data-label="BEAM Status">{p.beam_status}</td>
                      <td data-label="Flag">
                        {p.financial_need_flag && <span style={{ color: '#ef4444', background: '#fef2f2', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600 }}>Financial Need</span>}
                      </td>
                      <td data-label="Action">
                        <button className="icon-button" style={{ color: 'var(--accent-blue)', fontSize: '0.8rem', fontWeight: 600 }}
                          onClick={() => alert(`Review Profile module for ${p.student?.name || 'Student'} is under construction. Data locked.`)}>
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

      {isAddStaffModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddStaffModalOpen(false)}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', background: '#fff' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Add New Staff</h3>
              <button className="icon-button" onClick={() => setIsAddStaffModalOpen(false)}><X size={20} /></button>
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
    </div>
  );
};

export default ExecutiveOperations;
