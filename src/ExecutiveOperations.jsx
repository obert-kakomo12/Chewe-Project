import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, Award, ShieldAlert } from 'lucide-react';
import { API_BASE_URL } from './config';

const ExecutiveOperations = () => {
  const [activeTab, setActiveTab] = useState('staff-roster');
  const [staff, setStaff] = useState([]);
  const [pipeline, setPipeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const [staffRes, pipeRes] = await Promise.all([
          fetch(`${API_BASE_URL}/users/staff`, { headers }),
          fetch(`${API_BASE_URL}/welfare/sponsorship-pipeline`, { headers })
        ]);

        if (staffRes.ok) setStaff(await staffRes.json());
        if (pipeRes.ok) setPipeline(await pipeRes.json());
      } catch (err) {
        console.error('Failed to fetch executive ops data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="content-area" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>Loading...</div>;
  }

  return (
    <div className="content-area animate-fade-in" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(59,130,246,0.1)', padding: '10px', borderRadius: '8px', color: '#3b82f6' }}><Users size={20} /></div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0d1f45', margin: 0 }}>Executive Staff Roster</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Account Status</th>
                </tr>
              </thead>
              <tbody>
                {staff.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center' }}>No staff found.</td></tr>
                ) : (
                  staff.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td>{s.email}</td>
                      <td><span style={{ padding: '2px 8px', borderRadius: '10px', background: '#e0e7ff', color: '#4338ca', fontSize: '0.75rem', fontWeight: 600 }}>{s.role}</span></td>
                      <td style={{ color: 'var(--status-success)', fontWeight: 600 }}>Active</td>
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
            <p style={{ color: 'var(--text-secondary)' }}>Here executives can define the master Subject list and construct ClassRooms (e.g., Form 1 East) that teachers can select from.</p>
            <div style={{ padding: '20px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', textAlign: 'center', color: '#64748b' }}>
              Module initializing... connect to `/academics/subjects` and `/academics/classes` APIs.
            </div>
          </div>
        )}

        {activeTab === 'sponsorship' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(245,158,11,0.1)', padding: '10px', borderRadius: '8px', color: '#f59e0b' }}><Award size={20} /></div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0d1f45', margin: 0 }}>Sponsorship & Bursary Pipeline</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Auto-generated list of high-potential students (Confidence Index ≥ 75) who require financial assistance (BEAM/Arrears).</p>
            
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
                      <td style={{ fontWeight: 600 }}>{p.student?.name || 'Unknown Student'}</td>
                      <td>
                        <span style={{ color: 'var(--status-success)', fontWeight: 700 }}>{p.confidence_index} / 100</span>
                      </td>
                      <td>{p.beam_status}</td>
                      <td>
                        {p.financial_need_flag && <span style={{ color: '#ef4444', background: '#fef2f2', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600 }}>Financial Need</span>}
                      </td>
                      <td>
                        <button className="icon-button" style={{ color: 'var(--accent-blue)', fontSize: '0.8rem', fontWeight: 600 }}>Review Profile</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutiveOperations;
