import React from 'react';
import { ClipboardList, CheckCircle, TrendingUp, Search, PlusCircle, FileSpreadsheet } from 'lucide-react';

const mockAssessments = [
  { id: 'AST-001', subject: 'Mathematics', class: 'Form 3A', type: 'Continuous Assessment', date: '2026-06-01', avgScore: '68%', status: 'Graded' },
  { id: 'AST-002', subject: 'Physics',     class: 'Form 4B', type: 'Mid-Term Exam',         date: '2026-06-05', avgScore: '74%', status: 'Graded' },
  { id: 'AST-003', subject: 'English',     class: 'Form 2C', type: 'Pop Quiz',              date: '2026-06-08', avgScore: '—',   status: 'Pending Marking' },
  { id: 'AST-004', subject: 'Chemistry',   class: 'Form 3A', type: 'Continuous Assessment', date: '2026-06-10', avgScore: '—',   status: 'Scheduled' },
];

const statusBadge = (status) => {
  if (status === 'Graded')          return { bg: '#f0fdf4', color: '#065f46', border: '#6ee7b7' };
  if (status === 'Pending Marking') return { bg: '#fffbeb', color: '#92400e', border: '#fde68a' };
  return                                    { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
};

const AssessmentManagement = () => (
  <div className="content-area animate-fade-in">
    <div className="teacher-header">
      <div className="teacher-info">
        <h2>Student Assessment Management</h2>
        <p>Computational engine for continuous assessments and examinations</p>
      </div>
      <button className="primary-button">
        <PlusCircle size={16} /> New Assessment
      </button>
    </div>

    {/* KPIs */}
    <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '24px' }}>
      <div className="glass-panel metric-card hover-lift">
        <div className="metric-header"><span>Pending Graded</span><ClipboardList size={17} /></div>
        <div className="metric-value">12</div>
        <div className="metric-trend trend-up"><CheckCircle size={14} /><span>5 completed today</span></div>
      </div>
      <div className="glass-panel metric-card hover-lift">
        <div className="metric-header"><span>Average Z-Score</span><TrendingUp size={17} /></div>
        <div className="metric-value">+0.8</div>
        <div className="metric-trend trend-up"><TrendingUp size={14} /><span>↑0.2 from Term 1</span></div>
      </div>
      <div className="glass-panel metric-card hover-lift">
        <div className="metric-header"><span>Processing Time</span><FileSpreadsheet size={17} /></div>
        <div className="metric-value">2.4d</div>
        <div className="metric-trend trend-up" style={{ color: 'var(--status-success)' }}>
          <span>15% faster than baseline</span>
        </div>
      </div>
    </div>

    {/* Assessment table */}
    <div className="glass-panel hover-lift" style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <h3 className="section-title" style={{ margin: 0 }}>Recent &amp; Upcoming Assessments</h3>
        <div className="search-bar" style={{ width: '240px' }}>
          <Search size={16} className="text-secondary" />
          <input type="text" placeholder="Search ID or subject…" />
        </div>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th><th>Subject</th><th>Class</th><th>Type</th><th>Date</th><th>Avg Score</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {mockAssessments.map(a => {
            const badge = statusBadge(a.status);
            return (
              <tr key={a.id}>
                <td style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{a.id}</td>
                <td style={{ fontWeight: 500 }}>{a.subject}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{a.class}</td>
                <td>{a.type}</td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{a.date}</td>
                <td style={{ fontWeight: 700 }}>{a.avgScore}</td>
                <td>
                  <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700,
                    background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                    {a.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

export default AssessmentManagement;
