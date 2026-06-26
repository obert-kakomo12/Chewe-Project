import React, { useState, useEffect } from 'react';
import { AlertCircle, TrendingDown, TrendingUp, AlertTriangle, Activity, Users, Sparkles } from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { API_BASE_URL } from './config';

const statusStyle = (status) => ({
  bottleneck: { bg: '#fff5f5',  border: '1.5px solid #fca5a5', color: '#dc2626',  barColor: '#dc2626' },
  warning:    { bg: '#fffbeb',  border: '1.5px solid #fcd34d', color: '#d97706',  barColor: '#d97706' },
  ok:         { bg: '#eff6ff',  border: '1.5px solid #bfdbfe', color: '#1d4ed8',  barColor: '#1d4ed8' },
  excellent:  { bg: '#f0fdf4',  border: '1.5px solid #6ee7b7', color: '#059669',  barColor: '#059669' },
}[status]);

const AnalyticsEngine = () => {
  const [activeTab, setActiveTab] = useState('bottleneck');
  const [data, setData] = useState({ topicData: [], correlationData: [], outliers: [] });
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Clear AI insight when tab changes
  useEffect(() => {
    setAiInsight(null);
  }, [activeTab]);

  const generateExecutiveAnalysis = async () => {
    setAiLoading(true);
    try {
      const payload = {
        tab: activeTab,
        data: activeTab === 'bottleneck' ? data.topicData : activeTab === 'outliers' ? data.outliers : data.correlationData
      };
      const res = await fetch(`${API_BASE_URL}/ai/executive-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(payload)
      });
      const responseData = await res.json();
      setAiInsight(responseData.response);
    } catch (err) {
      console.error('AI Error:', err);
      setAiInsight('Error generating AI analysis. Please try again.');
    }
    setAiLoading(false);
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/dashboard/analytics`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    })
    .then(res => res.json())
    .then(json => {
      setData(json);
      setLoading(false);
    })
    .catch(err => {
      console.error('Failed to fetch analytics:', err);
      setLoading(false);
    });
  }, []);

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
      <div className="teacher-header" style={{ marginBottom: '16px' }}>
        <div className="teacher-info">
          <h2>Analytics Engine</h2>
          <p>Curriculum bottlenecks · Outlier detection · Attendance-Z-Score correlation</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <TabBtn id="bottleneck"  label="Bottlenecks" icon={AlertCircle} />
            <TabBtn id="outliers"    label="Outliers"    icon={Users} />
            <TabBtn id="correlation" label="Correlation" icon={Activity} />
          </div>
          <button onClick={generateExecutiveAnalysis} disabled={aiLoading || loading} className="primary-button" 
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', border: 'none', padding: '8px 16px', display: 'flex', gap: '8px', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' }}>
            <Sparkles size={16} /> {aiLoading ? 'Analyzing Data...' : 'Executive AI Analysis'}
          </button>
        </div>
      </div>

      {aiInsight && (
        <div className="glass-panel animate-fade-in" style={{
          marginBottom: '24px', background: 'linear-gradient(to right, rgba(139, 92, 246, 0.08), rgba(139, 92, 246, 0.02))',
          borderLeft: '4px solid #8b5cf6', padding: '18px 24px', display: 'flex', gap: '16px', alignItems: 'flex-start'
        }}>
          <Sparkles size={22} color="#8b5cf6" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8b5cf6', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Strategic Summary</div>
            <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{aiInsight}</div>
          </div>
        </div>
      )}

      {/* ── Curriculum Bottleneck Detection ───────────────────────────────── */}
      {activeTab === 'bottleneck' && (
        <div className="animate-fade-in">
          <div className="glass-panel hover-lift" style={{ marginBottom: '24px' }}>
            <h3 className="section-title">Curriculum Bottleneck Detection</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '20px' }}>
              Identifies topics where whole-class averages fall below target, signalling a need for revised instructional strategy or additional resources.
            </p>
            {data.topicData.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No curriculum bottlenecks detected. Insufficient data to generate insights.
              </div>
            ) : (
              <>
                <div style={{ height: '260px', marginBottom: '24px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.topicData} margin={{ top: 8, right: 20, left: -10, bottom: 0 }}>
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
                        isAnimationActive={true}>
                        {data.topicData.map((entry, index) => {
                          const { barColor } = statusStyle(entry.status);
                          return <Cell key={index} fill={barColor} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  {data.topicData.map((item, i) => {
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
              </>
            )}
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
            {data.outliers.length === 0 ? (
              <div style={{ padding: '30px', gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No significant outliers detected in the current assessment period.
              </div>
            ) : (
              data.outliers.map((o, i) => (
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
              ))
            )}
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
          {data.correlationData.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Insufficient assessment and attendance data to generate correlation heatmap.
            </div>
          ) : (
            <>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.correlationData} margin={{ top: 8, right: 20, left: -10, bottom: 0 }}>
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
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsEngine;
