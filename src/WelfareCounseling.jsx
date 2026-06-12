import React, { useState, useMemo } from 'react';
import { ShieldAlert, Lock, EyeOff, Search, BarChart2, BookOpen, TrendingUp, FileText } from 'lucide-react';

const mockLogs = [
  { id: 'WL-091', student: 'Sarah Connor',  priority: 'High',   type: 'Behavioral',      encrypted: true,  trigger: 'Trauma Triage'   },
  { id: 'WL-092', student: 'John Smith',    priority: 'Medium', type: 'Counseling',      encrypted: true,  trigger: 'Truancy Alert'   },
  { id: 'WL-093', student: 'Alice M',       priority: 'Low',    type: 'Academic Stress', encrypted: false, trigger: 'Teacher Referral'},
  { id: 'WL-094', student: 'Rudo Sibanda',  priority: 'High',   type: 'Trauma',          encrypted: true,  trigger: 'Trauma Triage'   },
];

const mockGuidance = [
  { student: 'Chipo Moyo',   rank: 3,  zScore: '+1.4', attendance: '96%', consistency: 'Excellent', fit: 'Engineering / Applied Mathematics',  summary: 'Consistent mastery in Sciences. Strong A-Level Sciences candidate.' },
  { student: 'Farai Ndlovu', rank: 12, zScore: '-0.3', attendance: '79%', consistency: 'Poor',      fit: 'Commerce / Business Studies',         summary: 'Attendance concerns impacting academic standing. Parental consultation recommended.' },
  { student: 'Tendai Nyoni', rank: 7,  zScore: '+0.6', attendance: '91%', consistency: 'Good',      fit: 'Accounting / Economics',              summary: 'Stable performer with affinity for numerical subjects. Commercials track advised.' },
];

const PRIORITY_BADGE = {
  High:   { bg: '#fff5f5', color: '#991b1b', border: '#fca5a5' },
  Medium: { bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
  Low:    { bg: '#f0fdf4', color: '#065f46', border: '#6ee7b7' },
};

const CONSISTENCY_COLOR = { Excellent: '#059669', Good: '#1d4ed8', Poor: '#dc2626' };

const TabBtn = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    background: active ? 'var(--accent-blue)' : '#ffffff',
    color: active ? '#ffffff' : 'var(--text-secondary)',
    border: '1.5px solid', borderColor: active ? 'var(--accent-blue)' : 'var(--border-color)',
    padding: '8px 16px', borderRadius: '7px', cursor: 'pointer',
    fontWeight: 600, fontSize: '0.8rem', transition: 'all var(--transition-fast)',
  }}>
    {label}
  </button>
);

const WelfareCounseling = () => {
  const [activeTab, setActiveTab] = useState('cases');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return mockLogs;
    const q = searchQuery.toLowerCase();
    return mockLogs.filter(log =>
      log.id.toLowerCase().includes(q) ||
      log.student.toLowerCase().includes(q) ||
      log.trigger.toLowerCase().includes(q) ||
      log.priority.toLowerCase().includes(q) ||
      log.type.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="content-area animate-fade-in">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div style={{
        background: '#ffffff', border: '1px solid var(--border-color)',
        borderLeft: '4px solid var(--status-danger)',
        padding: '18px 22px', borderRadius: '10px', marginBottom: '22px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
            Counseling Safe Space
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Cryptographically isolated welfare repository · Parental guidance engine
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px',
            background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: '20px',
            color: 'var(--status-danger)', fontWeight: 700, fontSize: '0.78rem' }}>
            <Lock size={13} /> Double-Lock Active
          </span>
          <TabBtn label="Case Repository" active={activeTab === 'cases'}    onClick={() => setActiveTab('cases')} />
          <TabBtn label="Guidance Reports" active={activeTab === 'guidance'} onClick={() => setActiveTab('guidance')} />
        </div>
      </div>

      {/* ── KPIs ─────────────────────────────────────────────────────────── */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', marginBottom: '24px' }}>
        {[
          { label: 'Active Cases',          value: '24',                                                              color: 'var(--text-primary)' },
          { label: 'High Priority',         value: String(filteredLogs.filter(l => l.priority === 'High').length),    color: 'var(--status-danger)' },
          { label: 'Resolved This Term',    value: '18',                                                              color: 'var(--status-success)' },
          { label: 'Guidance Reports Sent', value: '45',                                                              color: 'var(--accent-blue)' },
        ].map((m, i) => (
          <div key={i} className="glass-panel metric-card hover-lift">
            <div className="metric-header"><span>{m.label}</span><ShieldAlert size={15} /></div>
            <div className="metric-value" style={{ color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* ── Case Repository ───────────────────────────────────────────────── */}
      {activeTab === 'cases' && (
        <div className="dashboard-row" style={{ gridTemplateColumns: '1fr 2fr' }} >
          {/* Left panels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="glass-panel hover-lift" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
              <h3 className="section-title" style={{ color: '#92400e' }}>Access Audit</h3>
              <p style={{ fontSize: '0.8rem', color: '#92400e', marginBottom: '12px' }}>
                All access to welfare logs requires MFA and is permanently recorded.
              </p>
              <button className="secondary-button" style={{ width: '100%', justifyContent: 'center' }}>View Access Logs</button>
            </div>

            <div className="glass-panel hover-lift">
              <h3 className="section-title">Referral Pipeline</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Cases auto-added from Trauma Triage and Truancy Alerts.
              </p>
              {['Trauma Triage', 'Truancy Alert', 'Teacher Referral'].map((src, i, arr) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{src}</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>
                    {filteredLogs.filter(l => l.trigger === src).length}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Case table */}
          <div className="glass-panel hover-lift" style={{ overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 className="section-title" style={{ margin: 0 }}>Secure Case Repository</h3>
              <div className="search-bar" style={{ width: '200px' }}>
                <Search size={15} className="text-secondary" />
                <input 
                  type="text" 
                  placeholder="Search cases…" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>Case ID</th><th>Student</th><th>Trigger</th><th>Priority</th><th>Type</th><th>Data</th><th>Action</th></tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px' }}>
                      No cases found matching search query.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(log => {
                    const pb = PRIORITY_BADGE[log.priority];
                    return (
                      <tr key={log.id}>
                        <td style={{ fontWeight: 600 }}>{log.id}</td>
                        <td style={{ fontWeight: 500 }}>{log.student}</td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{log.trigger}</td>
                        <td>
                          <span style={{ padding: '2px 9px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700,
                            background: pb.bg, color: pb.color, border: `1px solid ${pb.border}` }}>
                            {log.priority}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.82rem' }}>{log.type}</td>
                        <td>
                          {log.encrypted
                            ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--status-success)', fontSize: '0.72rem', fontWeight: 600 }}><Lock size={11} /> Encrypted</span>
                            : <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '0.72rem' }}><EyeOff size={11} /> Standard</span>}
                        </td>
                        <td>
                          <button className="icon-button" style={{ color: log.encrypted ? 'var(--text-muted)' : 'var(--accent-blue)' }}>
                            {log.encrypted ? <Lock size={14} /> : <Search size={14} />}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Parental Guidance Reports ─────────────────────────────────────── */}
      {activeTab === 'guidance' && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Pulse Guidance Summary</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                Term-end reports for parents — Academic standing, consistency score, and vocational fit assessment.
              </p>
            </div>
            <button className="action-button"><FileText size={15} /> Generate All Reports</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mockGuidance.map((r, i) => (
              <div key={i} className="glass-panel hover-lift">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '3px' }}>{r.student}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{r.summary}</div>
                  </div>
                  <button className="secondary-button" style={{ fontSize: '0.75rem', flexShrink: 0 }}>
                    <FileText size={13} /> Export PDF
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: '12px' }}>
                  {/* Academic standing */}
                  <div style={{ background: '#f0f4f8', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <TrendingUp size={10} /> Academic Standing
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Rank #{r.rank}</div>
                    <div style={{ fontSize: '0.8rem', color: parseFloat(r.zScore) > 0 ? 'var(--status-success)' : 'var(--status-danger)', fontWeight: 600 }}>
                      Z-Score: {r.zScore}
                    </div>
                  </div>

                  {/* Consistency */}
                  <div style={{ background: '#f0f4f8', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <BarChart2 size={10} /> Consistency Score
                    </div>
                    <div style={{ fontWeight: 700, color: CONSISTENCY_COLOR[r.consistency] }}>{r.consistency}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Attendance: {r.attendance}</div>
                  </div>

                  {/* Vocational fit */}
                  <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <BookOpen size={10} /> Vocational Fit
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--accent-blue)', fontSize: '0.85rem' }}>{r.fit}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WelfareCounseling;
