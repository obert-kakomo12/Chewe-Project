import React, { useState, useEffect, useMemo } from 'react';
import { ShieldAlert, Lock, EyeOff, Search, BarChart2, BookOpen, TrendingUp, FileText, X } from 'lucide-react';
import { API_BASE_URL } from './config';

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
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedCase, setSelectedCase] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const handleSelectCase = (log) => {
    setSelectedCase(log);
    setAiSuggestion(null);
    setLoadingAi(true);
    fetch(`${API_BASE_URL}/welfare/predictive-suggestions/${log.dbId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    })
    .then(res => res.json())
    .then(data => {
      setAiSuggestion(data);
      setLoadingAi(false);
    })
    .catch(err => {
      console.error('Failed to fetch predictive suggestions:', err);
      setLoadingAi(false);
    });
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/welfare/dashboard`, {
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
      console.error('Failed to fetch welfare data:', err);
      setLoading(false);
    });
  }, []);

  const filteredLogs = useMemo(() => {
    if (!data || !data.logs) return [];
    if (!searchQuery.trim()) return data.logs;
    const q = searchQuery.toLowerCase();
    return data.logs.filter(log =>
      log.id.toLowerCase().includes(q) ||
      log.student.toLowerCase().includes(q) ||
      log.trigger.toLowerCase().includes(q) ||
      log.priority.toLowerCase().includes(q) ||
      log.type.toLowerCase().includes(q)
    );
  }, [searchQuery, data]);

  if (loading || !data) {
    return (
      <div className="content-area" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(59, 130, 246, 0.2)', borderTopColor: 'var(--accent-blue)', animation: 'spin 1s linear infinite' }} />
          <h2 style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Decrypting Secure Case Repository...</h2>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

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
          { label: 'Active Cases',          value: String(data.stats.activeCases),                               color: 'var(--text-primary)' },
          { label: 'High Priority',         value: String(data.stats.highPriority),                              color: 'var(--status-danger)' },
          { label: 'Resolved This Term',    value: String(data.stats.resolvedThisTerm),                          color: 'var(--status-success)' },
          { label: 'Guidance Reports Sent', value: String(data.stats.guidanceReportsSent),                       color: 'var(--accent-blue)' },
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {selectedCase && (
              <div className="glass-panel hover-lift animate-fade-in" style={{ borderLeft: '4px solid var(--accent-blue)', background: '#eff6ff', border: '1.5px solid #bfdbfe', padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 className="section-title" style={{ margin: 0, color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldAlert size={16} /> AI Counsel Advisor
                  </h3>
                  <button className="icon-button" onClick={() => setSelectedCase(null)} style={{ padding: 2, background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <X size={15} />
                  </button>
                </div>
                <div style={{ fontSize: '0.85rem', marginBottom: '12px', color: 'var(--text-primary)' }}>
                  Analyzing: <strong style={{ color: 'var(--text-primary)' }}>{selectedCase.student}</strong> ({selectedCase.id})
                </div>
                {loadingAi ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(59,130,246,0.2)', borderTopColor: 'var(--accent-blue)', animation: 'spin 1s linear infinite' }} />
                    Generating recommendations...
                  </div>
                ) : aiSuggestion ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '3px' }}>Predicted Stressor</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--status-danger)' }}>{aiSuggestion.stressor}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '3px' }}>Suggested Action Plan</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #bfdbfe', lineHeight: 1.35 }}>
                        {aiSuggestion.recommendation}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(5, 150, 105, 0.1)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(5, 150, 105, 0.25)' }}>
                      <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>Recovery Probability:</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669' }}>{aiSuggestion.successRate}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            <div className="glass-panel hover-lift" style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '18px' }}>
              <h3 className="section-title" style={{ color: '#92400e', margin: 0, marginBottom: '8px' }}>Access Audit</h3>
              <p style={{ fontSize: '0.8rem', color: '#92400e', marginBottom: '12px' }}>
                All access to welfare logs requires MFA and is permanently recorded.
              </p>
              <button className="secondary-button" style={{ width: '100%', justifyContent: 'center' }}>View Access Logs</button>
            </div>

            <div className="glass-panel hover-lift" style={{ padding: '18px' }}>
              <h3 className="section-title" style={{ margin: 0, marginBottom: '8px' }}>Referral Pipeline</h3>
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
          <div className="glass-panel hover-lift" style={{ overflowX: 'auto', flex: 1, padding: '18px' }}>
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
                    const pb = PRIORITY_BADGE[log.priority] || PRIORITY_BADGE.Medium;
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
                        <td style={{ fontSize: '0.85rem' }}>{log.type}</td>
                        <td>
                          {log.encrypted
                            ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--status-success)', fontSize: '0.72rem', fontWeight: 600 }}><Lock size={11} /> Encrypted</span>
                            : <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '0.72rem' }}><EyeOff size={11} /> Standard</span>}
                        </td>
                        <td>
                          <button onClick={() => handleSelectCase(log)} className="icon-button" style={{ color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer' }}>
                            <Search size={14} /> Analyze
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
            {data.guidance.length === 0 ? (
              <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No guidance reports generated this term.
              </div>
            ) : (
              data.guidance.map((r, i) => (
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
            )))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WelfareCounseling;
