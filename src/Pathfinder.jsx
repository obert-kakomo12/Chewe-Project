import React, { useState, useEffect } from 'react';
import { FlaskConical, Briefcase, BookOpen, AlertTriangle } from 'lucide-react';

const TRACKS = [
  { key: 'Sciences',    label: 'Sciences Track',    color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
  { key: 'Commercials', label: 'Commercials Track', color: '#059669', bg: '#f0fdf4', border: '#6ee7b7' },
  { key: 'Arts',        label: 'Arts Track',        color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd' },
];

const TabBtn = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    background: active ? 'var(--accent-blue)' : '#ffffff',
    color: active ? '#ffffff' : 'var(--text-secondary)',
    border: '1.5px solid',
    borderColor: active ? 'var(--accent-blue)' : 'var(--border-color)',
    padding: '8px 18px', borderRadius: '7px',
    cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
    transition: 'all var(--transition-fast)',
  }}>
    {label}
  </button>
);

const Pathfinder = () => {
  const [activeTab, setActiveTab] = useState('proposals');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://13.140.177.98:3000/academics/pathfinder', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    })
    .then(res => res.json())
    .then(json => {
      setData(json);
      setLoading(false);
    })
    .catch(err => {
      console.error('Failed to fetch pathfinder data:', err);
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
      <div className="content-area" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(59, 130, 246, 0.2)', borderTopColor: 'var(--accent-blue)', animation: 'spin 1s linear infinite' }} />
          <h2 style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Calculating Z-Scores & Streaming Pathways...</h2>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="content-area animate-fade-in">
      <div className="teacher-header">
        <div className="teacher-info">
          <h2>The Pathfinder</h2>
          <p>Automated Level 3 Streaming &amp; Transition Proposals</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <TabBtn label="Streaming Proposals" active={activeTab === 'proposals'} onClick={() => setActiveTab('proposals')} />
          <TabBtn label="Departmental Alerts"  active={activeTab === 'alerts'}    onClick={() => setActiveTab('alerts')} />
        </div>
      </div>

      {/* ── Streaming Proposals ──────────────────────────────────────────── */}
      {activeTab === 'proposals' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }} className="animate-fade-in">
          {TRACKS.map(track => (
            <div key={track.key} className="glass-panel hover-lift"
              style={{ borderTop: `4px solid ${track.color}` }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
                {track.label}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {data.proposals.filter(s => s.recommended === track.key).length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    No students currently mapped to this track.
                  </div>
                ) : (
                  data.proposals.filter(s => s.recommended === track.key).map(s => (
                  <div key={s.id} style={{
                    background: track.bg,
                    border: `1.5px solid ${track.border}`,
                    padding: '12px', borderRadius: '8px',
                    borderLeft: `3px solid ${track.color}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{s.name}</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: track.color,
                        background: '#fff', padding: '2px 7px', borderRadius: '10px', border: `1px solid ${track.border}` }}>
                        Z: {s.zScore}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Requested: <strong>{s.requested}</strong>
                    </div>
                    {!s.match && (
                      <div style={{ marginTop: '8px', display: 'flex', gap: '6px', alignItems: 'flex-start',
                        color: '#92400e', fontSize: '0.75rem',
                        background: '#fffbeb', padding: '7px 9px', borderRadius: '5px',
                        border: '1px solid #fde68a' }}>
                        <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: '1px' }} />
                        <span>Mismatch: {s.reason}. Counseling required.</span>
                      </div>
                    )}
                  </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Departmental Alerts ──────────────────────────────────────────── */}
      {activeTab === 'alerts' && (
        <div className="glass-panel animate-fade-in" style={{ maxWidth: '760px', margin: '0 auto' }}>
          <h3 className="section-title">Departmental Load Alerts</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.85rem' }}>
            Real-time funnelling notifications dispatched to Department Heads.
          </p>
          <div className="alert-list">
            {data.alerts.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No active departmental load alerts.
              </div>
            ) : (
              data.alerts.map((alert, i) => (
                <div key={i} className={`alert-item ${alert.type === 'warning' ? 'warning' : ''}`} style={{ borderLeftColor: alert.color }}>
                  <div className="alert-content">
                    <h4>{alert.title}</h4>
                    <p>{alert.message}</p>
                  </div>
                  <div className="alert-time">{alert.time}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Pathfinder;
