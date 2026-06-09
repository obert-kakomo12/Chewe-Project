import React, { useState } from 'react';
import { Shield, Key, EyeOff, Activity, AlertOctagon, Lock } from 'lucide-react';

const mockAuditLogs = [
  { id: 1, time: '2026-06-09 08:15:22', user: 'Mrs. N. Dube', action: 'MARK_UPDATE', details: 'Changed Math In-Class mark for CT24-004 from 45 to 65', ip: '192.168.1.14', status: 'SUCCESS' },
  { id: 2, time: '2026-06-09 07:42:01', user: 'SYSTEM', action: 'BRUTE_FORCE_LOCK', details: 'Account lockout triggered for user ID 8842. 5 failed MFA attempts.', ip: '41.216.222.10', status: 'WARNING' },
  { id: 3, time: '2026-06-09 07:30:10', user: 'Principal Moyo', action: 'WELFARE_DECRYPT', details: 'Used Master Key to decrypt Trauma Log for CT24-019', ip: '192.168.1.2', status: 'SUCCESS' },
  { id: 4, time: '2026-06-08 14:20:00', user: 'Mr. T. Banda', action: 'REPORT_GENERATE', details: 'Generated Term 2 Report Books for Form 3 Arts', ip: '192.168.1.45', status: 'SUCCESS' },
];

const SettingsAudit = () => {
  const [doubleLockEnabled, setDoubleLockEnabled] = useState(true);
  const [mfaEnabled, setMfaEnabled] = useState(true);

  return (
    <div className="content-area animate-fade-in">
      <div className="teacher-header">
        <div className="teacher-info">
          <h2>Security & Audit Vault</h2>
          <p>End-to-End Encryption Configuration & Immortal Activity Log</p>
        </div>
      </div>

      <div className="dashboard-row" style={{ gridTemplateColumns: '1fr 2fr' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel hover-lift">
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={20} color="var(--status-success)" /> System Hardening
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Key size={16} /> Double-Lock Welfare
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Encrypts trauma data (requires 2 keys)</div>
                </div>
                <div 
                  onClick={() => setDoubleLockEnabled(!doubleLockEnabled)}
                  style={{ width: '40px', height: '24px', background: doubleLockEnabled ? 'var(--status-success)' : 'rgba(255,255,255,0.2)', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'var(--transition-fast)' }}
                >
                  <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: doubleLockEnabled ? '19px' : '3px', transition: 'var(--transition-fast)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lock size={16} /> MFA Enforcement
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Requires mobile OTP for all staff</div>
                </div>
                <div 
                  onClick={() => setMfaEnabled(!mfaEnabled)}
                  style={{ width: '40px', height: '24px', background: mfaEnabled ? 'var(--accent-blue)' : 'rgba(255,255,255,0.2)', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'var(--transition-fast)' }}
                >
                  <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: mfaEnabled ? '19px' : '3px', transition: 'var(--transition-fast)' }} />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '3px solid var(--status-danger)', borderRadius: '0 8px 8px 0' }}>
              <div style={{ fontWeight: 600, color: 'var(--status-danger)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <AlertOctagon size={16} /> Brute-Force Protection Active
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Accounts automatically lock and IP addresses are blacklisted after 3 failed login attempts.
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel hover-lift" style={{ overflowX: 'auto' }}>
          <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="var(--accent-purple)" /> Immortal Audit Log
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            This log is non-mutable. It records all system activity to prevent data tampering.
          </p>

          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action Type</th>
                <th>Details</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {mockAuditLogs.map(log => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{log.time}</td>
                  <td style={{ fontWeight: 500 }}>{log.user}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.7rem', 
                      fontWeight: 600,
                      background: log.status === 'WARNING' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                      color: log.status === 'WARNING' ? 'var(--status-warning)' : 'var(--accent-blue)'
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.875rem' }}>{log.details}</td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SettingsAudit;
