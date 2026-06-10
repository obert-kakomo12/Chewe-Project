import React, { useState } from 'react';
import { Compass, Beaker, Briefcase, Palette, AlertTriangle, Users, BookOpen } from 'lucide-react';

const MOCK_STREAMING_STUDENTS = [
  { id: 'CT24-81', name: 'James Nyika', zScore: 1.8, recommended: 'Sciences', requested: 'Sciences', match: true },
  { id: 'CT24-82', name: 'Sarah Musoni', zScore: 1.2, recommended: 'Commercials', requested: 'Sciences', match: false, reason: 'Low Science Z-Score' },
  { id: 'CT24-83', name: 'Leo Gumbo', zScore: 2.1, recommended: 'Sciences', requested: 'Sciences', match: true },
  { id: 'CT24-84', name: 'Tariro Chikwe', zScore: 0.9, recommended: 'Arts', requested: 'Arts', match: true },
  { id: 'CT24-85', name: 'Brian Dube', zScore: -0.2, recommended: 'Arts', requested: 'Commercials', match: false, reason: 'Requires high velocity for Accounts' },
];

const Pathfinder = () => {
  const [activeTab, setActiveTab] = useState('proposals');

  return (
    <div className="content-area animate-fade-in">
      <div className="teacher-header">
        <div className="teacher-info">
          <h2>
            The Pathfinder
          </h2>
          <p>Automated Level 3 Streaming & Transition Proposals</p>
        </div>
        
        <div className="class-selector" style={{ background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '8px', display: 'flex', gap: '4px' }}>
          <button 
            onClick={() => setActiveTab('proposals')}
            style={{ 
              background: activeTab === 'proposals' ? 'var(--bg-secondary)' : 'transparent', 
              color: activeTab === 'proposals' ? '#fff' : 'var(--text-secondary)',
              border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 500, transition: 'var(--transition-fast)' 
            }}
          >
            Streaming Proposals
          </button>
          <button 
            onClick={() => setActiveTab('alerts')}
            style={{ 
              background: activeTab === 'alerts' ? 'var(--bg-secondary)' : 'transparent', 
              color: activeTab === 'alerts' ? '#fff' : 'var(--text-secondary)',
              border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 500, transition: 'var(--transition-fast)' 
            }}
          >
            Departmental Alerts
          </button>
        </div>
      </div>

      {activeTab === 'proposals' && (
        <div className="dashboard-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '24px' }}>
          {/* Sciences Column */}
          <div className="glass-panel hover-lift" style={{ borderTop: '4px solid #3b82f6' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.125rem' }}>
              Sciences Track
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {MOCK_STREAMING_STUDENTS.filter(s => s.recommended === 'Sciences').map(s => (
                <div key={s.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #3b82f6' }}>
                  <div style={{ fontWeight: 500, display: 'flex', justifyContent: 'space-between' }}>
                    {s.name} <span style={{ fontSize: '0.75rem', color: '#3b82f6' }}>Z: {s.zScore}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Requested: {s.requested}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Commercials Column */}
          <div className="glass-panel hover-lift" style={{ borderTop: '4px solid #10b981' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.125rem' }}>
              Commercials Track
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {MOCK_STREAMING_STUDENTS.filter(s => s.recommended === 'Commercials').map(s => (
                <div key={s.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                  <div style={{ fontWeight: 500, display: 'flex', justifyContent: 'space-between' }}>
                    {s.name} <span style={{ fontSize: '0.75rem', color: '#10b981' }}>Z: {s.zScore}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Requested: {s.requested}</div>
                  {!s.match && (
                    <div style={{ marginTop: '8px', display: 'flex', gap: '6px', alignItems: 'flex-start', color: 'var(--status-warning)', fontSize: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', padding: '6px', borderRadius: '4px' }}>
                      <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                      <span>Mismatch Alert: {s.reason}. Counseling Required.</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Arts Column */}
          <div className="glass-panel hover-lift" style={{ borderTop: '4px solid #8b5cf6' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.125rem' }}>
              Arts Track
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {MOCK_STREAMING_STUDENTS.filter(s => s.recommended === 'Arts').map(s => (
                <div key={s.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #8b5cf6' }}>
                  <div style={{ fontWeight: 500, display: 'flex', justifyContent: 'space-between' }}>
                    {s.name} <span style={{ fontSize: '0.75rem', color: '#8b5cf6' }}>Z: {s.zScore}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Requested: {s.requested}</div>
                  {!s.match && (
                    <div style={{ marginTop: '8px', display: 'flex', gap: '6px', alignItems: 'flex-start', color: 'var(--status-warning)', fontSize: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', padding: '6px', borderRadius: '4px' }}>
                      <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                      <span>Mismatch Alert: {s.reason}. Counseling Required.</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="glass-panel animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h3 className="section-title">Departmental Load Alerts</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.875rem' }}>
            Real-time funneling notifications dispatched to Department Heads.
          </p>

          <div className="alert-list">
            <div className="alert-item" style={{ borderLeftColor: '#3b82f6' }}>
              <Beaker size={20} color="#3b82f6" className="alert-icon" />
              <div className="alert-content">
                <h4>To: Science Department Head</h4>
                <p>35 students have qualified for Level 3 Physics. 5 students flagged as 'High-Potential Outliers' for Advanced Level track.</p>
              </div>
              <div className="alert-time">2 mins ago</div>
            </div>

            <div className="alert-item" style={{ borderLeftColor: '#10b981' }}>
              <Briefcase size={20} color="#10b981" className="alert-icon" />
              <div className="alert-content">
                <h4>To: Commercials Department Head</h4>
                <p>Level 3 class lists are finalized. 3 students with 'Trauma History' have been placed in your homeroom; please review encrypted welfare logs.</p>
              </div>
              <div className="alert-time">1 hour ago</div>
            </div>

            <div className="alert-item" style={{ borderLeftColor: 'var(--status-warning)' }}>
              <AlertTriangle size={20} color="var(--status-warning)" className="alert-icon" />
              <div className="alert-content">
                <h4>To: Principal & Counselors</h4>
                <p>12 Mismatch Alerts generated. These students requested streams misaligned with their historical Z-scores. Parent consultations needed.</p>
              </div>
              <div className="alert-time">3 hours ago</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pathfinder;
