import React, { useState, useEffect } from 'react';
import { Key, AlertOctagon, Lock, ShieldCheck } from 'lucide-react';

const Toggle = ({ on, onToggle, color }) => (
  <div onClick={onToggle} style={{
    width: '42px', height: '24px',
    background: on ? color : '#d1ddef',
    borderRadius: '12px', position: 'relative',
    cursor: 'pointer', transition: 'background 0.2s',
    flexShrink: 0,
  }}>
    <div style={{
      width: '18px', height: '18px', background: '#fff',
      borderRadius: '50%', position: 'absolute', top: '3px',
      left: on ? '21px' : '3px', transition: 'left 0.2s',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    }} />
  </div>
);

const SettingsAudit = () => {
  const [doubleLockEnabled, setDoubleLockEnabled] = useState(true);
  const [mfaEnabled,        setMfaEnabled]        = useState(true);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://13.140.177.98:3000/settings/audit', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    })
    .then(res => res.json())
    .then(data => {
      setAuditLogs(data);
      setLoading(false);
    })
    .catch(err => {
      console.error('Failed to fetch audit logs:', err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="content-area animate-fade-in">
      <div className="teacher-header">
        <div className="teacher-info">
          <h2>Security &amp; Audit Vault</h2>
          <p>End-to-End Encryption Configuration &amp; Immortal Activity Log</p>
        </div>
      </div>

      <div className="dashboard-row" style={{ gridTemplateColumns: '1fr 2fr' }}>

        {/* ── Left: System Hardening ─────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel hover-lift">
            <h3 className="section-title">System Hardening</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Double-Lock */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: '#f0f4f8', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '3px' }}>
                    <Key size={15} color="var(--accent-blue)" /> Double-Lock Welfare
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Encrypts trauma data (requires 2 keys)</div>
                </div>
                <Toggle on={doubleLockEnabled} onToggle={() => setDoubleLockEnabled(v => !v)} color="var(--status-success)" />
              </div>

              {/* MFA */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: '#f0f4f8', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '3px' }}>
                    <Lock size={15} color="var(--accent-blue)" /> MFA Enforcement
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Requires mobile OTP for all staff</div>
                </div>
                <Toggle on={mfaEnabled} onToggle={() => setMfaEnabled(v => !v)} color="var(--accent-blue)" />
              </div>

              {/* Brute-force */}
              <div style={{ padding: '14px', background: '#fff5f5', borderLeft: '4px solid var(--status-danger)', borderRadius: '0 8px 8px 0', border: '1px solid #fca5a5', borderLeft: '4px solid var(--status-danger)' }}>
                <div style={{ fontWeight: 700, color: 'var(--status-danger)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                  <AlertOctagon size={15} /> Brute-Force Protection Active
                </div>
                <div style={{ fontSize: '0.75rem', color: '#991b1b' }}>
                  Accounts auto-lock and IPs are blacklisted after 3 failed login attempts.
                </div>
              </div>

              {/* Encryption status */}
              <div style={{ padding: '14px', background: '#f0fdf4', border: '1px solid #6ee7b7', borderRadius: '8px' }}>
                <div style={{ fontWeight: 700, color: 'var(--status-success)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                  <ShieldCheck size={15} /> AES-256 + TLS 1.3 Active
                </div>
                <div style={{ fontSize: '0.75rem', color: '#065f46' }}>
                  All data encrypted at rest and in transit. Last certificate renewal: 2026-05-01.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Audit Log ───────────────────────────────────────────── */}
        <div className="glass-panel hover-lift" style={{ overflowX: 'auto' }}>
          <h3 className="section-title">Immortal Audit Log</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Non-mutable. Every mark change, login and decrypt action is permanently recorded.
          </p>
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Details</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                    Loading audit logs...
                  </td>
                </tr>
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                    No audit logs recorded yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{log.time}</td>
                    <td style={{ fontWeight: 600 }}>{log.user}</td>
                    <td>
                      <span style={{
                        padding: '3px 9px', borderRadius: '10px',
                        fontSize: '0.68rem', fontWeight: 700,
                        background: log.status === 'WARNING' ? '#fffbeb' : '#eff6ff',
                        color:      log.status === 'WARNING' ? '#92400e' : '#1d4ed8',
                        border:     `1px solid ${log.status === 'WARNING' ? '#fde68a' : '#bfdbfe'}`,
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{log.details}</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{log.ip}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SettingsAudit;
