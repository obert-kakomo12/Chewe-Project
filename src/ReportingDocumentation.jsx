import React from 'react';
import { FileText, Download, Printer, FileSpreadsheet, CheckCircle, Clock } from 'lucide-react';

const mockReports = [
  { id: 'REP-101', name: 'Term 1 Ministry Compliance Report', type: 'Statutory',    date: '2026-04-15', status: 'Generated' },
  { id: 'REP-102', name: 'Form 3 Academic Transcripts',        type: 'Institutional',date: '2026-06-08', status: 'Generating...' },
  { id: 'REP-103', name: 'End of Year Financial Summary',       type: 'Financial',   date: '2025-12-10', status: 'Archived' },
];

const statusBadge = (status) => {
  if (status === 'Generated')    return { bg: '#f0fdf4', color: '#065f46', border: '#6ee7b7' };
  if (status === 'Generating...') return { bg: '#fffbeb', color: '#92400e', border: '#fde68a' };
  return                                  { bg: '#f0f4f8', color: '#4a6080', border: '#d1ddef' };
};

const ReportingDocumentation = () => (
  <div className="content-area animate-fade-in">
    <div className="teacher-header">
      <div className="teacher-info">
        <h2>Reporting &amp; Documentation Engine</h2>
        <p>Automated compilation for statutory and institutional records</p>
      </div>
      <button className="primary-button">
        <FileText size={16} /> Generate New Report
      </button>
    </div>

    {/* KPIs */}
    <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '24px' }}>
      <div className="glass-panel metric-card hover-lift">
        <div className="metric-header"><span>Statutory Compliance</span><CheckCircle size={17} /></div>
        <div className="metric-value">100%</div>
        <div className="metric-trend trend-up"><span>All Term 1 returns filed</span></div>
      </div>
      <div className="glass-panel metric-card hover-lift">
        <div className="metric-header"><span>Active Compilations</span><Clock size={17} /></div>
        <div className="metric-value">3</div>
        <div className="metric-trend" style={{ color: 'var(--status-warning)' }}><span>Transcripts processing…</span></div>
      </div>
      <div className="glass-panel metric-card hover-lift">
        <div className="metric-header"><span>Data Sources Linked</span><FileSpreadsheet size={17} /></div>
        <div className="metric-value">14</div>
        <div className="metric-trend trend-up"><span>Assessment, Attendance &amp; Welfare</span></div>
      </div>
    </div>

    {/* Report table */}
    <div className="glass-panel hover-lift" style={{ overflowX: 'auto' }}>
      <h3 className="section-title">Report Repository</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Report ID</th><th>Name</th><th>Type</th><th>Date</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockReports.map(r => {
            const badge = statusBadge(r.status);
            return (
              <tr key={r.id}>
                <td style={{ fontWeight: 600 }}>{r.id}</td>
                <td style={{ fontWeight: 500 }}>{r.name}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{r.type}</td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{r.date}</td>
                <td>
                  <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700,
                    background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                    {r.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="icon-button" disabled={r.status === 'Generating...'}
                      style={{ color: r.status === 'Generating...' ? 'var(--text-muted)' : 'var(--accent-blue)' }}>
                      <Download size={16} />
                    </button>
                    <button className="icon-button" disabled={r.status === 'Generating...'}
                      style={{ color: r.status === 'Generating...' ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
                      <Printer size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

export default ReportingDocumentation;
