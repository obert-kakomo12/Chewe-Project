import React from 'react';
import { FileText, Download, Printer, FileSpreadsheet, CheckCircle, Clock } from 'lucide-react';

const mockReports = [
  { id: 'REP-101', name: 'Term 1 Ministry Compliance Report', type: 'Statutory', date: '2026-04-15', status: 'Generated' },
  { id: 'REP-102', name: 'Form 3 Academic Transcripts', type: 'Institutional', date: '2026-06-08', status: 'Generating...' },
  { id: 'REP-103', name: 'End of Year Financial Summary', type: 'Financial', date: '2025-12-10', status: 'Archived' },
];

const ReportingDocumentation = () => {
  return (
    <div className="content-area animate-fade-in">
      <div className="teacher-header">
        <div className="teacher-info">
          <h2>Reporting & Documentation Engine</h2>
          <p>Automated compilation engine for statutory and institutional records.</p>
        </div>
        <button className="primary-button">
          <FileText size={18} /> Generate New Report
        </button>
      </div>

      <div className="dashboard-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="glass-panel metric-card hover-lift">
          <div className="metric-header">
            <span>Statutory Compliance</span>
            <CheckCircle size={20} className="text-secondary" />
          </div>
          <div className="metric-value">100%</div>
          <div className="metric-trend trend-up">
            <span>All Term 1 returns filed</span>
          </div>
        </div>

        <div className="glass-panel metric-card hover-lift">
          <div className="metric-header">
            <span>Active Compilations</span>
            <Clock size={20} className="text-secondary" />
          </div>
          <div className="metric-value">3</div>
          <div className="metric-trend trend-up" style={{ color: 'var(--status-warning)' }}>
            <span>Transcripts processing...</span>
          </div>
        </div>
        
        <div className="glass-panel metric-card hover-lift">
          <div className="metric-header">
            <span>Data Sources Linked</span>
            <FileSpreadsheet size={20} className="text-secondary" />
          </div>
          <div className="metric-value">14</div>
          <div className="metric-trend trend-up">
            <span>Assessment, Attendance & Welfare</span>
          </div>
        </div>
      </div>

      <div className="glass-panel hover-lift" style={{ marginTop: '24px' }}>
        <h3 className="section-title">Report Repository</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockReports.map(report => (
              <tr key={report.id}>
                <td style={{ fontWeight: 500 }}>{report.id}</td>
                <td>{report.name}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{report.type}</td>
                <td style={{ fontSize: '0.875rem' }}>{report.date}</td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    background: report.status === 'Generated' ? 'rgba(16, 185, 129, 0.2)' : 
                                report.status === 'Generating...' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    color: report.status === 'Generated' ? 'var(--status-success)' : 
                           report.status === 'Generating...' ? 'var(--status-warning)' : 'var(--text-secondary)'
                  }}>
                    {report.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="icon-button" disabled={report.status === 'Generating...'}>
                      <Download size={16} />
                    </button>
                    <button className="icon-button" disabled={report.status === 'Generating...'}>
                      <Printer size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportingDocumentation;
