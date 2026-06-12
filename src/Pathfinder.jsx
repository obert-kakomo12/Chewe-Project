import React, { useState } from 'react';
import { FlaskConical, Briefcase, BookOpen, AlertTriangle } from 'lucide-react';

const MOCK_STREAMING_STUDENTS = [
  { id: 'CT24-81', name: 'James Nyika',    zScore: 1.8,  recommended: 'Sciences',    requested: 'Sciences',    match: true  },
  { id: 'CT24-82', name: 'Sarah Musoni',   zScore: 1.2,  recommended: 'Commercials', requested: 'Sciences',    match: false, reason: 'Low Science Z-Score' },
  { id: 'CT24-83', name: 'Leo Gumbo',      zScore: 2.1,  recommended: 'Sciences',    requested: 'Sciences',    match: true  },
  { id: 'CT24-84', name: 'Tariro Chikwe',  zScore: 0.9,  recommended: 'Arts',        requested: 'Arts',        match: true  },
  { id: 'CT24-85', name: 'Brian Dube',     zScore: -0.2, recommended: 'Arts',        requested: 'Commercials', match: false, reason: 'Requires high velocity for Accounts' },
];

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
                {MOCK_STREAMING_STUDENTS.filter(s => s.recommended === track.key).map(s => (
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
                ))}
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
            <div className="alert-item" style={{ borderLeftColor: '#1d4ed8' }}>
              <FlaskConical size={18} color="#1d4ed8" className="alert-icon" />
              <div className="alert-content">
                <h4>To: Science Department Head</h4>
                <p>35 students have qualified for Level 3 Physics. 5 flagged as High-Potential Outliers for Advanced Level track.</p>
              </div>
              <div className="alert-time">2 mins ago</div>
            </div>
            <div className="alert-item" style={{ borderLeftColor: '#059669' }}>
              <Briefcase size={18} color="#059669" className="alert-icon" />
              <div className="alert-content">
                <h4>To: Commercials Department Head</h4>
                <p>Level 3 class lists finalised. 3 students with Trauma History placed in your homeroom — review encrypted welfare logs.</p>
              </div>
              <div className="alert-time">1 hour ago</div>
            </div>
            <div className="alert-item warning">
              <AlertTriangle size={18} className="alert-icon" />
              <div className="alert-content">
                <h4>To: Principal &amp; Counselors</h4>
                <p>12 Mismatch Alerts generated. Students requested streams misaligned with historical Z-scores. Parent consultations needed.</p>
              </div>
              <div className="alert-time">3 hours ago</div>
            </div>
            <div className="alert-item" style={{ borderLeftColor: '#7c3aed' }}>
              <BookOpen size={18} color="#7c3aed" className="alert-icon" />
              <div className="alert-content">
                <h4>To: Arts Department Head</h4>
                <p>Level 3 Arts class finalised with 28 students. 2 students recommended for Advanced Literature track.</p>
              </div>
              <div className="alert-time">4 hours ago</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pathfinder;
