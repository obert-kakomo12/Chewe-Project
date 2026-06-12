import React, { useState } from 'react';
import { AlertCircle, TrendingDown, TrendingUp, AlertTriangle, Activity, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// Curriculum bottleneck data (representative mock)
const TOPIC_DATA = [
  { topic: 'Algebraic Expressions',  avg: 72, target: 60, status: 'ok' },
  { topic: 'Quadratic Equations',    avg: 41, target: 60, status: 'bottleneck' },
  { topic: 'Trigonometry',           avg: 55, target: 60, status: 'warning' },
  { topic: 'Data Representation',    avg: 85, target: 60, status: 'excellent' },
  { topic: 'Calculus — Derivatives', avg: 38, target: 60, status: 'bottleneck' },
  { topic: 'Probability',            avg: 64, target: 60, status: 'ok' },
];

// Attendance-vs-ZScore correlation data
const CORRELATION_DATA = [
  { attendance: '50-59%', avgZ: -1.4 },
  { attendance: '60-69%', avgZ: -0.9 },
  { attendance: '70-79%', avgZ: -0.4 },
  { attendance: '80-84%', avgZ: 0.0 },
  { attendance: '85-89%', avgZ: 0.3 },
  { attendance: '90-94%', avgZ: 0.7 },
  { attendance: '95-100%',avgZ: 1.2 },
];

// Student outlier data
const OUTLIERS = [
  { name: 'Chipo Moyo',     zScore: 2.1, status: 'high', subject: 'Mathematics' },
  { name: 'Leo Gumbo',      zScore: 1.9, status: 'high', subject: 'Physics' },
  { name: 'Rudo Sibanda',   zScore: -1.8, status: 'low', subject: 'Chemistry' },
  { name: 'Brian Dube',     zScore: -1.6, status: 'low', subject: 'Mathematics' },
];

const statusStyle = (status) => ({
  bottleneck: { bg: '#fff5f5',  border: '1.5px solid #fca5a5', color: '#dc2626',  barColor: '#dc2626' },
  warning:    { bg: '#fffbeb',  border: '1.5px solid #fcd34d', color: '#d97706',  barColor: '#d97706' },
  ok:         { bg: '#eff6ff',  border: '1.5px solid #bfdbfe', color: '#1d4ed8',  barColor: '#1d4ed8' },
  excellent:  { bg: '#f0fdf4',  border: '1.5px solid #6ee7b7', color: '#059669',  barColor: '#059669' },
}[status]);

const AnalyticsEngine = () => {
  const [activeTab, setActiveTab] = useState('bottleneck');

  const TabBtn = ({ id, label, icon: Icon }) => (
    <button onClick={() => setActiveTab(id)} style={{
      background: activeTab === id ? 'var(--accent-blue)' : '#ffffff',
      color: activeTab === id ? '#fff' : 'var(--text-secondary)',
      border: '1.5px solid', borderColor: activeTab === id ? 'var(--accent-blue)' : 'var(--border-color)',
      padding: '8px 16px', borderRadius: '7px', cursor: 'pointer',
      fontWeight: 600, fontSize: '0.8rem', transition: 'all var(--transition-fast)',
      display: 'flex', alignItems: 'center', gap: '6px',
    }}>
      {Icon && <Icon size={14} />}{label}
    </button>
  );

  return (
    <div className="content-area animate-fade-in">
      <div className="teacher-header">
        <div className="teacher-info">
          <h2>Analytics Engine</h2>
          <p>Curriculum bottlenecks · Outlier detection · Attendance-Z-Score correlation</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <TabBtn id="bottleneck"  label="Bottlenecks" icon={AlertCircle} />
          <TabBtn id="outliers"    label="Outliers"    icon={Users} />
          <TabBtn id="correlation" label="Correlation" icon={Activity} />
        </div>
      </div>

      {/* ── Curriculum Bottleneck Detection ───────────────────────────────── */}
      {activeTab === 'bottleneck' && (
        <div className="animate-fade-in">
          <div className="glass-panel hover-lift" style={{ marginBottom: '24px' }}>
            <h3 className="section-title">Curriculum Bottleneck Detection</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '20px' }}>
              Identifies topics where whole-class averages fall below target, signalling a need for revised instructional strategy or additional resources.
            </p>
            <div style={{ height: '260px', marginBottom: '24px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={TOPIC_DATA} margin={{ top: 8, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4ecf5" vertical={false} />
                  <XAxis dataKey="topic" stroke="#8fa5c0" fontSize={10} tickLine={false} axisLine={false}
                    tick={{ fill: '#4a6080', fontSize: 10 }} />
                  <YAxis stroke="#8fa5c0" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ background: '#ffffff', border: '1px solid #d1ddef', borderRadius: '8px', boxShadow: '0 4px 12px rgba(13,31,69,0.12)' }}
                    itemStyle={{ color: '#0d1f45' }} labelStyle={{ color: '#4a6080', fontWeight: 600 }}
                    formatter={(v) => [`${v}%`, 'Class Avg']}
                  />
                  <ReferenceLine y={60} stroke="#d97706" strokeDasharray="5 5"
                    label={{ value: 'Target 60%', fill: '#d97706', fontSize: 11, position: 'insideTopRight' }} />
                  <Bar dataKey="avg" radius={[4, 4, 0, 0]}
                    fill="#1d72e8"
                    label={false}
                    // colour each bar by status
                    isAnimationActive={true}>
                    {TOPIC_DATA.map((entry, index) => {
                      const { barColor } = statusStyle(entry.status);
                      return <cell key={index} fill={barColor} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {TOPIC_DATA.map((item, i) => {
                const s = statusStyle(item.status);
                return (
                  <div key={i} style={{ background: s.bg, border: s.border, padding: '14px', borderRadius: '6px', position: 'relative' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px', paddingRight: '24px' }}>{item.topic}</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: s.color }}>{item.avg}%</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Target: {item.target}%</div>
                    {item.status === 'bottleneck' && (
                      <>
                        <AlertCircle size={15} color="var(--status-danger)" style={{ position: 'absolute', top: '14px', right: '14px' }} />
                        <div style={{ marginTop: '8px', fontSize: '0.7rem', color: 'var(--status-danger)', fontWeight: 600 }}>
                          SYSTEM FLAG: Class-wide failure. Resource review recommended.
                        </div>
                      </>
                    )}
                    {item.status === 'excellent' && (
                      <div style={{ marginTop: '8px', fontSize: '0.7rem', color: 'var(--status-success)', fontWeight: 600 }}>✓ Mastery achieved</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Outlier Detection ─────────────────────────────────────────────── */}
      {activeTab === 'outliers' && (
        <div className="glass-panel hover-lift animate-fade-in">
          <h3 className="section-title">Z-Score Outlier Detection</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Students whose Z-score deviates significantly (&gt;1.5σ) from the class mean. High outliers are advanced candidates; low outliers need immediate intervention.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            {OUTLIERS.map((o, i) => (
              <div key={i} style={{
                background: o.status === 'high' ? '#f0fdf4' : '#fff5f5',
                border: `1.5px solid ${o.status === 'high' ? '#6ee7b7' : '#fca5a5'}`,
                borderRadius: '10px', padding: '18px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, color: '#0d1f45', fontSize: '0.95rem' }}>{o.name}</span>
                  {o.status === 'high'
                    ? <TrendingUp size={18} color="#059669" />
                    : <TrendingDown size={18} color="#dc2626" />}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#4a6080', marginBottom: '12px' }}>{o.subject}</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: o.status === 'high' ? '#059669' : '#dc2626' }}>
                  {o.zScore > 0 ? '+' : ''}{o.zScore}σ
                </div>
                <div style={{ marginTop: '10px', fontSize: '0.75rem', fontWeight: 600, color: o.status === 'high' ? '#059669' : '#dc2626' }}>
                  {o.status === 'high' ? '⬆ High Potential — A-Level Track candidate' : '⬇ Below threshold — Intervention required'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Attendance–Z-Score Correlation ────────────────────────────────── */}
      {activeTab === 'correlation' && (
        <div className="glass-panel hover-lift animate-fade-in">
          <h3 className="section-title">Attendance vs Z-Score Correlation Heatmap</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Demonstrates the direct relationship between a student's attendance percentage and their academic Z-score — a powerful tool for parent-teacher consultations.
          </p>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CORRELATION_DATA} margin={{ top: 8, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4ecf5" vertical={false} />
                <XAxis dataKey="attendance" stroke="#8fa5c0" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#8fa5c0" fontSize={11} tickLine={false} axisLine={false} domain={[-2, 2]} />
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #d1ddef', borderRadius: '8px', boxShadow: '0 4px 12px rgba(13,31,69,0.12)' }}
                  itemStyle={{ color: '#0d1f45' }} labelStyle={{ color: '#4a6080', fontWeight: 600 }}
                  formatter={(v) => [v, 'Avg Z-Score']}
                />
                <ReferenceLine y={0} stroke="#d1ddef" />
                <Bar dataKey="avgZ" radius={[4, 4, 0, 0]} fill="#1d72e8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: '16px', padding: '14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '0.8rem', color: '#4a6080' }}>
            <strong style={{ color: 'var(--accent-blue)' }}>Key Finding:</strong> Students with attendance below 80% show an average Z-score of −0.9, confirming that absenteeism is the single strongest predictor of academic underperformance in this dataset.
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsEngine;
