import React, { useState } from 'react';
import { ShieldAlert, Heart, Lock, AlertTriangle, EyeOff, Search } from 'lucide-react';

const mockLogs = [
  { id: 'WL-091', student: 'Sarah Connor', date: '2026-06-08', priority: 'High', type: 'Behavioral', encrypted: true },
  { id: 'WL-092', student: 'John Smith', date: '2026-06-07', priority: 'Medium', type: 'Counseling', encrypted: true },
  { id: 'WL-093', student: 'Alice M', date: '2026-06-05', priority: 'Low', type: 'Academic Stress', encrypted: false },
];

const WelfareCounseling = () => {
  const [doubleLockEnabled, setDoubleLockEnabled] = useState(true);

  return (
    <div className="content-area animate-fade-in">
      <div className="teacher-header" style={{ background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.1) 0%, rgba(26, 29, 45, 1) 100%)', borderLeft: '4px solid var(--status-danger)' }}>
        <div className="teacher-info">
          <h2>Student Welfare & Counseling (Safe Space)</h2>
          <p>Highly secure, cryptographically isolated repository for behavioral and counseling logs.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '20px', color: 'var(--status-danger)', fontWeight: 600 }}>
          <Lock size={16} /> Double-Lock Active
        </div>
      </div>

      <div className="dashboard-row" style={{ gridTemplateColumns: '1fr 2fr' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel hover-lift">
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Heart size={20} color="var(--status-danger)" /> Counseling Metrics
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Active Cases</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>24</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>High Priority</span>
                <span style={{ fontWeight: 'bold', color: 'var(--status-danger)' }}>5</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Resolved This Term</span>
                <span style={{ fontWeight: 'bold', color: 'var(--status-success)' }}>18</span>
              </div>
            </div>
          </div>

          <div className="glass-panel hover-lift" style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-warning)' }}>
              <AlertTriangle size={20} /> Access Audit
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              All access to welfare logs is permanently audited and requires Multi-Factor Authentication.
            </p>
            <button className="secondary-button" style={{ width: '100%' }}>View Access Logs</button>
          </div>
        </div>

        <div className="glass-panel hover-lift" style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 className="section-title" style={{ margin: 0 }}>Secure Case Repository</h3>
            <div className="search-bar" style={{ width: '200px' }}>
              <Search size={18} className="text-secondary" />
              <input type="text" placeholder="Search Cases..." />
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Student</th>
                <th>Priority</th>
                <th>Type</th>
                <th>Data Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {mockLogs.map(log => (
                <tr key={log.id}>
                  <td style={{ fontWeight: 500 }}>{log.id}</td>
                  <td>{log.student}</td>
                  <td>
                    <span style={{ color: log.priority === 'High' ? 'var(--status-danger)' : log.priority === 'Medium' ? 'var(--status-warning)' : 'var(--status-success)' }}>
                      {log.priority}
                    </span>
                  </td>
                  <td>{log.type}</td>
                  <td>
                    {log.encrypted ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--status-success)', fontSize: '0.75rem' }}>
                        <Lock size={12} /> Encrypted
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                        <EyeOff size={12} /> Standard
                      </span>
                    )}
                  </td>
                  <td>
                    <button className="icon-button" title={log.encrypted ? "Requires Decryption Key" : "View Details"}>
                      {log.encrypted ? <Lock size={16} /> : <Search size={16} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WelfareCounseling;
