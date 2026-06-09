import React from 'react';
import { LineChart, AlertCircle, Layers } from 'lucide-react';

const mockTopics = [
  { topic: 'Algebraic Expressions', avg: 72, target: 60, status: 'ok' },
  { topic: 'Quadratic Equations', avg: 41, target: 60, status: 'bottleneck' },
  { topic: 'Trigonometry', avg: 55, target: 60, status: 'warning' },
  { topic: 'Data Representation', avg: 85, target: 60, status: 'excellent' },
];

const AnalyticsEngine = () => {
  return (
    <div className="content-area animate-fade-in">
      <div className="teacher-header">
        <div className="teacher-info">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LineChart size={28} color="var(--accent-blue)" /> Analytics Engine
          </h2>
          <p>Value Multipliers & Curriculum Bottleneck Detection</p>
        </div>
      </div>

      <div className="dashboard-row" style={{ gridTemplateColumns: '1fr' }}>
        <div className="glass-panel hover-lift">
          <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={20} color="var(--status-warning)" /> Curriculum Bottleneck Detection
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px' }}>
            Identifies specific topics where the entire class is failing, signaling a need for better teaching resources or a change in instructional strategy.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {mockTopics.map((item, idx) => {
              let bg = 'rgba(255,255,255,0.05)';
              let border = '1px solid var(--border-color)';
              let icon = null;

              if (item.status === 'bottleneck') {
                bg = 'rgba(239, 68, 68, 0.15)';
                border = '1px solid var(--status-danger)';
                icon = <AlertCircle size={16} color="var(--status-danger)" />;
              } else if (item.status === 'warning') {
                bg = 'rgba(245, 158, 11, 0.1)';
                border = '1px solid var(--status-warning)';
              } else if (item.status === 'excellent') {
                bg = 'rgba(16, 185, 129, 0.1)';
                border = '1px solid var(--status-success)';
              }

              return (
                <div key={idx} style={{ background: bg, border, padding: '16px', borderRadius: '8px', position: 'relative' }}>
                  <div style={{ fontWeight: 500, marginBottom: '8px', fontSize: '0.875rem' }}>{item.topic}</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: item.status === 'bottleneck' ? 'var(--status-danger)' : '#fff' }}>
                    {item.avg}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Target: {item.target}%</div>
                  {icon && (
                    <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                      {icon}
                    </div>
                  )}
                  {item.status === 'bottleneck' && (
                    <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--status-danger)', fontWeight: 500 }}>
                      SYSTEM FLAG: Class-wide failure detected. Recommend resource review.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsEngine;
