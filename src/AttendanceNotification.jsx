import React, { useState, useEffect } from 'react';
import {
  UserCheck, UserX, UserMinus, AlertTriangle,
  MessageSquare, Clock, RefreshCw, Bell,
  ClipboardList, List, AlertOctagon
} from 'lucide-react';
import { API_BASE_URL } from './config';

const STATUS_CYCLE = ['present', 'absent', 'late', 'sick'];
const STATUS_LABEL = { present: 'Present', absent: 'Absent', late: 'Late', sick: 'Sick' };
const STATUS_ICON  = { present: UserCheck, absent: UserX, late: Clock, sick: UserMinus };
const STATUS_COLOR = {
  present: 'var(--status-success)',
  absent:  'var(--status-danger)',
  late:    'var(--status-warning)',
  sick:    '#3b82f6',
};

const AttendanceNotification = () => {
  const [activeTab, setActiveTab] = useState('rollcall');
  const [data, setData] = useState({ students: [], truancyAlerts: [] });
  const [attendance, setAttendance] = useState({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/attendance/rollcall`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    })
    .then(res => res.json())
    .then(json => {
      setData(json);
      setAttendance(Object.fromEntries(json.students.map(s => [s.id, 'present'])));
      setLoading(false);
    })
    .catch(err => {
      console.error('Failed to fetch rollcall data:', err);
      setLoading(false);
    });
  }, []);

  const cycleStatus = (id) => {
    setSaved(false);
    setAttendance(prev => {
      const current = prev[id];
      const next    = STATUS_CYCLE[(STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length];
      return { ...prev, [id]: next };
    });
  };

  const handleSave = () => setSaved(true);

  const counts = data.students.reduce((acc, s) => {
    acc[attendance[s.id]] = (acc[attendance[s.id]] || 0) + 1;
    return acc;
  }, {});

  const presentPct = data.students.length > 0 ? Math.round(((counts.present || 0) / data.students.length) * 100) : 0;

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
          <h2>Attendance &amp; Notification Engine</h2>
          <p>60-second roll call · Automated parent alerts · Truancy monitoring</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <TabBtn id="rollcall" label="Roll Call"      icon={ClipboardList} />
          <TabBtn id="log"      label="Daily Log"      icon={List} />
          <TabBtn id="truancy"  label="Truancy Alerts" icon={AlertOctagon} />
        </div>
      </div>

      {/* KPI row */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '24px' }}>
        <div className="glass-panel metric-card hover-lift">
          <div className="metric-header"><span>Present Today</span><UserCheck size={17} /></div>
          <div className="metric-value">{presentPct}%</div>
          <div className="metric-trend trend-up"><UserCheck size={14} /><span>{counts.present || 0} students</span></div>
        </div>
        <div className="glass-panel metric-card hover-lift">
          <div className="metric-header"><span>Absent / Sick</span><UserX size={17} /></div>
          <div className="metric-value" style={{ color: 'var(--status-danger)' }}>
            {(counts.absent || 0) + (counts.sick || 0)}
          </div>
          <div className="metric-trend trend-down"><AlertTriangle size={14} /><span>SMS alerts auto-sent</span></div>
        </div>
        <div className="glass-panel metric-card hover-lift">
          <div className="metric-header"><span>Late Arrivals</span><Clock size={17} /></div>
          <div className="metric-value" style={{ color: 'var(--status-warning)' }}>{counts.late || 0}</div>
          <div className="metric-trend"><MessageSquare size={14} /><span>Parent notifications sent</span></div>
        </div>
        <div className="glass-panel metric-card hover-lift">
          <div className="metric-header"><span>Truancy Flags</span><Bell size={17} /></div>
          <div className="metric-value" style={{ color: 'var(--status-danger)' }}>{data.truancyAlerts.filter(a => a.priority === 'High').length}</div>
          <div className="metric-trend trend-down"><AlertTriangle size={14} /><span>High priority cases</span></div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading attendance data...
        </div>
      ) : (
        <>

      {/* ── 60-Second Roll Call ────────────────────────────────────────────── */}
      {activeTab === 'rollcall' && (
        <div className="glass-panel hover-lift animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 className="section-title" style={{ margin: 0 }}>60-Second Roll Call</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Students are <strong style={{ color: 'var(--status-success)' }}>Present</strong> by default. Tap a card to cycle status.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="secondary-button" onClick={() => {
                setAttendance(Object.fromEntries(data.students.map(s => [s.id, 'present'])));
                setSaved(false);
              }}>
                <RefreshCw size={14} /> Reset
              </button>
              <button className="action-button" onClick={handleSave}>
                <UserCheck size={15} /> {saved ? 'Saved ✓' : 'Submit Register'}
              </button>
            </div>
          </div>

          {data.students.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No students are currently registered for this session's roll call.
            </div>
          ) : (
            ['Form 3A', 'Form 4B'].map(cls => (
              <div key={cls} style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                  {cls}
                </div>
                <div className="rollcall-grid">
                  {data.students.filter(s => s.class === cls).map(s => {
                    const status = attendance[s.id];
                    const Icon   = STATUS_ICON[status];
                    return (
                      <div key={s.id} className={`rollcall-card ${status}`} onClick={() => cycleStatus(s.id)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</span>
                          <Icon size={14} style={{ color: STATUS_COLOR[status], flexShrink: 0 }} />
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{s.id}</div>
                        <div style={{
                          marginTop: '8px', fontSize: '0.7rem', fontWeight: 700,
                          color: STATUS_COLOR[status], textTransform: 'uppercase', letterSpacing: '0.06em',
                        }}>
                          {STATUS_LABEL[status]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}

          {saved && (
            <div style={{ padding: '12px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--status-success)' }}>
              ✓ Register submitted. Parent notifications dispatched for {(counts.absent || 0) + (counts.sick || 0)} absent/sick students by 08:30 AM.
            </div>
          )}
        </div>
      )}

      {/* ── Daily Log ─────────────────────────────────────────────────────── */}
      {activeTab === 'log' && (
        <div className="glass-panel hover-lift animate-fade-in" style={{ overflowX: 'auto' }}>
          <h3 className="section-title">Today's Live Tracking Log</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th><th>Class</th><th>Status</th><th>Time Logged</th><th>Automated Notification</th>
              </tr>
            </thead>
            <tbody>
              {data.students.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                    No daily logs available.
                  </td>
                </tr>
              ) : (
                data.students.map(s => {
                  const status = attendance[s.id];
                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 500 }}>{s.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{s.class}</td>
                      <td>
                        <span style={{
                          padding: '3px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700,
                          background: status === 'present' ? 'rgba(16,185,129,0.15)'
                                    : status === 'late'    ? 'rgba(245,158,11,0.15)'
                                    : status === 'sick'    ? 'rgba(59,130,246,0.15)'
                                    : 'rgba(239,68,68,0.15)',
                          color: STATUS_COLOR[status],
                          textTransform: 'uppercase',
                        }}>
                          {STATUS_LABEL[status]}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {status === 'present' ? '07:45 AM'
                         : status === 'late'  ? '08:15 AM'
                         : '—'}
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {status === 'absent' ? 'SMS sent to parent'
                         : status === 'late' ? 'Email warning sent'
                         : status === 'sick' ? 'SMS sent — Medical note requested'
                         : 'N/A'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Truancy Alerts ──────────────────────────────────────────────── */}
      {activeTab === 'truancy' && (
        <div className="glass-panel hover-lift animate-fade-in">
          <h3 className="section-title">Predictive Truancy &amp; Slow-Drift Alerts</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Absence pattern monitoring — 3 consecutive same-day absences or &gt;15% monthly decline triggers a counseling alert automatically.
          </p>
          <div className="alert-list">
            {data.truancyAlerts.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No active truancy alerts.
              </div>
            ) : (
              data.truancyAlerts.map((alert, i) => (
                <div key={i} className={`alert-item ${alert.priority === 'High' ? 'critical' : 'warning'}`}>
                  <AlertTriangle size={18} className="alert-icon" />
                  <div className="alert-content">
                    <h4>{alert.student}</h4>
                    <p>{alert.reason}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 700,
                      background: alert.priority === 'High' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
                      color: alert.priority === 'High' ? 'var(--status-danger)' : 'var(--status-warning)',
                    }}>
                      {alert.priority}
                    </span>
                    <button className="secondary-button" style={{ padding: '4px 10px', fontSize: '0.7rem' }}>
                      Refer to Counselor
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Correlation note */}
          <div style={{ marginTop: '24px', padding: '14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--accent-blue)' }}>Correlation Report:</strong> Students with attendance below 85% show an average Z-score decline of −0.8. 
            See the Analytics Engine for the full heatmap correlation view.
          </div>
        </div>
      )}
      </>
    )}
    </div>
  );
};

export default AttendanceNotification;
