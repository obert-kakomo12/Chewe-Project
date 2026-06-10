import React from 'react';
import { UserCheck, UserX, UserMinus, AlertTriangle, MessageSquare, Clock } from 'lucide-react';

const mockAttendance = [
  { student: 'John Doe', class: 'Form 3A', status: 'Present', time: '07:45 AM', notification: 'N/A' },
  { student: 'Jane Smith', class: 'Form 3A', status: 'Absent', time: '--', notification: 'SMS Sent to Parent' },
  { student: 'Robert Mugabe', class: 'Form 4B', status: 'Late', time: '08:15 AM', notification: 'Email Warning Sent' },
  { student: 'Mary Ndlovu', class: 'Form 2C', status: 'Present', time: '07:30 AM', notification: 'N/A' },
];

const AttendanceNotification = () => {
  return (
    <div className="content-area animate-fade-in">
      <div className="teacher-header">
        <div className="teacher-info">
          <h2>Attendance & Notification Engine</h2>
          <p>Real-time tracking interface with automated messaging gateways.</p>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="glass-panel metric-card hover-lift">
          <div className="metric-header">
            <span>Overall Attendance</span>
            <UserCheck size={20} className="text-secondary" />
          </div>
          <div className="metric-value">94.8%</div>
          <div className="metric-trend trend-down">
            <UserMinus size={16} />
            <span>1.2% drop from yesterday</span>
          </div>
        </div>

        <div className="glass-panel metric-card hover-lift">
          <div className="metric-header">
            <span>Absenteeism</span>
            <UserX size={20} className="text-secondary" />
          </div>
          <div className="metric-value">3.2%</div>
          <div className="metric-trend trend-down">
            <AlertTriangle size={16} />
            <span>Action Required: 5 Students</span>
          </div>
        </div>

        <div className="glass-panel metric-card hover-lift">
          <div className="metric-header">
            <span>Gateways Triggered</span>
            <MessageSquare size={20} className="text-secondary" />
          </div>
          <div className="metric-value">142</div>
          <div className="metric-trend trend-up">
            <Clock size={16} />
            <span>SMS & Email Alerts Today</span>
          </div>
        </div>
      </div>

      <div className="glass-panel hover-lift" style={{ marginTop: '24px', overflowX: 'auto' }}>
        <h3 className="section-title">Today's Live Tracking Log</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Class</th>
              <th>Status</th>
              <th>Time Logged</th>
              <th>Automated Notification</th>
            </tr>
          </thead>
          <tbody>
            {mockAttendance.map((record, index) => (
              <tr key={index}>
                <td style={{ fontWeight: 500 }}>{record.student}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{record.class}</td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    background: record.status === 'Present' ? 'rgba(16, 185, 129, 0.2)' : 
                                record.status === 'Late' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: record.status === 'Present' ? 'var(--status-success)' : 
                           record.status === 'Late' ? 'var(--status-warning)' : 'var(--status-danger)'
                  }}>
                    {record.status}
                  </span>
                </td>
                <td style={{ fontSize: '0.875rem' }}>{record.time}</td>
                <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{record.notification}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceNotification;
