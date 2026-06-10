import React, { useState } from 'react';
import { ClipboardList, CheckCircle, TrendingUp, Search, PlusCircle, FileSpreadsheet } from 'lucide-react';

const mockAssessments = [
  { id: 'AST-001', subject: 'Mathematics', class: 'Form 3A', type: 'Continuous Assessment', date: '2026-06-01', avgScore: '68%', status: 'Graded' },
  { id: 'AST-002', subject: 'Physics', class: 'Form 4B', type: 'Mid-Term Exam', date: '2026-06-05', avgScore: '74%', status: 'Graded' },
  { id: 'AST-003', subject: 'English', class: 'Form 2C', type: 'Pop Quiz', date: '2026-06-08', avgScore: '—', status: 'Pending Marking' },
  { id: 'AST-004', subject: 'Chemistry', class: 'Form 3A', type: 'Continuous Assessment', date: '2026-06-10', avgScore: '—', status: 'Scheduled' },
];

const AssessmentManagement = () => {
  return (
    <div className="content-area animate-fade-in">
      <div className="teacher-header">
        <div className="teacher-info">
          <h2>Student Assessment Management</h2>
          <p>Computational Engine for Continuous Assessments and Examinations</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="primary-button">
            <PlusCircle size={18} /> New Assessment
          </button>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="glass-panel metric-card hover-lift">
          <div className="metric-header">
            <span>Pending Graded</span>
            <ClipboardList size={20} className="text-secondary" />
          </div>
          <div className="metric-value">12</div>
          <div className="metric-trend trend-up">
            <CheckCircle size={16} />
            <span>5 completed today</span>
          </div>
        </div>

        <div className="glass-panel metric-card hover-lift">
          <div className="metric-header">
            <span>Average Z-Score</span>
            <TrendingUp size={20} className="text-secondary" />
          </div>
          <div className="metric-value">+0.8</div>
          <div className="metric-trend trend-up">
            <TrendingUp size={16} />
            <span>0.2 increase from Term 1</span>
          </div>
        </div>

        <div className="glass-panel metric-card hover-lift">
          <div className="metric-header">
            <span>Exam Processing Time</span>
            <FileSpreadsheet size={20} className="text-secondary" />
          </div>
          <div className="metric-value">2.4 Days</div>
          <div className="metric-trend trend-down">
            <TrendingUp size={16} />
            <span>15% faster than baseline</span>
          </div>
        </div>
      </div>

      <div className="glass-panel hover-lift" style={{ marginTop: '24px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 className="section-title" style={{ margin: 0 }}>Recent & Upcoming Assessments</h3>
          <div className="search-bar" style={{ width: '250px' }}>
            <Search size={18} className="text-secondary" />
            <input type="text" placeholder="Search ID or Subject..." />
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Subject</th>
              <th>Class</th>
              <th>Type</th>
              <th>Date</th>
              <th>Avg Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {mockAssessments.map(assessment => (
              <tr key={assessment.id}>
                <td style={{ fontWeight: 500 }}>{assessment.id}</td>
                <td>{assessment.subject}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{assessment.class}</td>
                <td>{assessment.type}</td>
                <td style={{ fontSize: '0.875rem' }}>{assessment.date}</td>
                <td style={{ fontWeight: 600 }}>{assessment.avgScore}</td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    background: assessment.status === 'Graded' ? 'rgba(16, 185, 129, 0.2)' : 
                                assessment.status === 'Pending Marking' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                    color: assessment.status === 'Graded' ? 'var(--status-success)' : 
                           assessment.status === 'Pending Marking' ? 'var(--status-warning)' : 'var(--accent-blue)'
                  }}>
                    {assessment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssessmentManagement;
