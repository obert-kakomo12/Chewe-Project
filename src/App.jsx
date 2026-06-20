import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, GraduationCap, ShieldAlert,
  LineChart, Settings, Bell, Search, TrendingUp, TrendingDown,
  AlertCircle, AlertTriangle, UserCheck, ClipboardList,
  FileText, Database, Menu, X
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import CTLogo from './CTLogo';

import TeacherWorkstation     from './TeacherWorkstation';
import LoginScreen             from './LoginScreen';
import Pathfinder              from './Pathfinder';
import AnalyticsEngine         from './AnalyticsEngine';
import SettingsAudit           from './SettingsAudit';
import AssessmentManagement    from './AssessmentManagement';
import AttendanceNotification  from './AttendanceNotification';
import WelfareCounseling       from './WelfareCounseling';
import ReportingDocumentation  from './ReportingDocumentation';
import EducationalArchive      from './EducationalArchive';
import EncryptionBarrier       from './EncryptionBarrier';
import ResetPasswordScreen     from './ResetPasswordScreen';

const InstitutionalHeatmap = ({ heatmapData }) => (
  <div className="glass-panel hover-lift" style={{ marginTop: '24px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
      <div>
        <h3 className="section-title" style={{ margin: 0 }}>Institutional Performance Heatmap</h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Live color-coded grid. Rows = Classes · Columns = Subjects
        </p>
      </div>
      <div style={{ display: 'flex', gap: '16px', fontSize: '0.7rem', fontWeight: 600 }}>
        <span style={{ color: '#065f46', background: '#d1fae5', padding: '2px 8px', borderRadius: '10px', border: '1px solid #a7f3d0' }}>● Mastery ≥75%</span>
        <span style={{ color: '#92400e', background: '#fef3c7', padding: '2px 8px', borderRadius: '10px', border: '1px solid #fde68a' }}>● Steady 50–74%</span>
        <span style={{ color: '#991b1b', background: '#fee2e2', padding: '2px 8px', borderRadius: '10px', border: '1px solid #fca5a5' }}>● Critical &lt;50%</span>
      </div>
    </div>
    
    {heatmapData.length === 0 ? (
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        No assessment data available to generate heatmap.
      </div>
    ) : (
      <div className="heatmap-grid">
        <table className="heatmap-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left', paddingLeft: '8px' }}>Class</th>
              {Array.from(new Set(heatmapData.map(d => d.subject))).map(s => <th key={s}>{s}</th>)}
            </tr>
          </thead>
          <tbody>
            {Array.from(new Set(heatmapData.map(d => d.class))).map(cls => (
              <tr key={cls}>
                <td style={{
                  textAlign: 'left', fontWeight: 600, fontSize: '0.75rem',
                  color: 'var(--text-secondary)', paddingLeft: '8px',
                  background: 'transparent', border: 'none', minWidth: '90px'
                }}>
                  {cls}
                </td>
                {Array.from(new Set(heatmapData.map(d => d.subject))).map(subj => {
                  const cell = heatmapData.find(d => d.class === cls && d.subject === subj);
                  const avg = cell ? cell.avg : 0;
                  
                  const heatClass = (avg) => {
                    if (avg >= 75) return 'heatmap-emerald';
                    if (avg >= 50) return 'heatmap-amber';
                    return 'heatmap-crimson';
                  };
                  
                  const heatLabel = (avg) => {
                    if (avg >= 75) return `${avg}%`;
                    if (avg >= 50) return `${avg}%`;
                    return `${avg}% ⚠`;
                  };
                  
                  return (
                    <td key={subj} className={avg > 0 ? heatClass(avg) : ''} title={avg > 0 ? `${cls} · ${subj}: ${avg}%` : 'No data'}>
                      {avg > 0 ? heatLabel(avg) : '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { id: 'war-room',   label: 'Executive War Room',    icon: LayoutDashboard },
      { id: 'analytics',  label: 'Analytics Engine',     icon: LineChart },
    ]
  },
  {
    label: 'Academic',
    items: [
      { id: 'teacher',    label: 'Teacher Workstation',   icon: Users },
      { id: 'assessment', label: 'Assessment Management', icon: ClipboardList },
      { id: 'pathfinder', label: 'Level 3 Streaming',     icon: GraduationCap },
    ]
  },
  {
    label: 'Student Support',
    items: [
      { id: 'attendance', label: 'Attendance & Alerts',   icon: UserCheck },
      { id: 'safe-space', label: 'Counseling Safe Space', icon: ShieldAlert },
    ]
  },
  {
    label: 'Administration',
    items: [
      { id: 'reports',    label: 'Reporting & Docs',      icon: FileText },
      { id: 'archive',    label: 'Educational Archive',   icon: Database },
      { id: 'settings',   label: 'Settings & Audit',      icon: Settings },
    ]
  }
];

const Sidebar = ({ activeItem, setActiveItem, isMobileOpen, setIsMobileOpen, currentUser }) => {
  const isAdmin = currentUser?.role === 'Admin';
  const filteredSections = NAV_SECTIONS.map(section => ({
    ...section,
    items: section.items.filter(item => {
      if (!isAdmin && ['war-room', 'analytics', 'settings'].includes(item.id)) return false;
      return true;
    })
  })).filter(section => section.items.length > 0);

  return (
  <>
    {isMobileOpen && <div className="mobile-overlay" onClick={() => setIsMobileOpen(false)} />}
    <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-logo">
        <CTLogo variant="dark" size="sm" />
        {isMobileOpen && (
          <button className="icon-button" style={{ marginLeft: 'auto' }} onClick={() => setIsMobileOpen(false)}>
            <X size={20} />
          </button>
        )}
      </div>

      <nav style={{ flex: 1, paddingBottom: '24px' }}>
        {filteredSections.map(section => (
          <div key={section.label}>
            <div className="sidebar-section-label">{section.label}</div>
            {section.items.map(item => (
              <div
                key={item.id}
                className={`nav-item ${activeItem === item.id ? 'active' : ''}`}
                onClick={() => { setActiveItem(item.id); setIsMobileOpen(false); }}
              >
                <item.icon size={17} />
                {item.label}
              </div>
            ))}
          </div>
        ))}
      </nav>

      <div style={{ padding: '14px 20px 18px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>
        v1.0 · AES-256 · MoPSE Compliant
      </div>
    </aside>
  </>
  );
};

// ─── Topbar ───────────────────────────────────────────────────────────────────
const pageTitle = {
  'war-room':   'Executive War Room',
  'analytics':  'Analytics Engine',
  'teacher':    'Teacher Workstation',
  'assessment': 'Assessment Management',
  'pathfinder': 'Level 3 Streaming',
  'attendance': 'Attendance & Alerts',
  'safe-space': 'Counseling Safe Space',
  'reports':    'Reporting & Documentation',
  'archive':    'Educational Archive',
  'settings':   'Settings & Audit Vault',
};

const TopBar = ({ activeItem, setIsMobileOpen, setActiveItem, setIsAuthenticated, setIsDecrypted }) => {
  const [isSearchOpen,       setIsSearchOpen]       = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen,       setIsProfileOpen]       = useState(false);

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button className="menu-toggle" onClick={() => setIsMobileOpen(true)}><Menu size={22} /></button>
        <div className="topbar-title">{pageTitle[activeItem] || ''}</div>
      </div>

      <div className="topbar-actions" style={{ position: 'relative' }}>
        {isSearchOpen ? (
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.12)', borderRadius: '6px', padding: '5px 10px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <Search size={15} color="rgba(255,255,255,0.7)" />
            <input autoFocus type="text" placeholder="Search…"
              style={{ border: 'none', outline: 'none', padding: '3px 8px', fontSize: '0.875rem', width: '140px', background: 'transparent', color: '#ffffff' }} />
            <button className="icon-button" onClick={() => setIsSearchOpen(false)}><X size={14} /></button>
          </div>
        ) : (
          <button className="icon-button" onClick={() => setIsSearchOpen(true)}><Search size={19} /></button>
        )}

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button className="icon-button" style={{ position: 'relative' }}
            onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsProfileOpen(false); }}>
            <Bell size={19} />
            <span style={{ position: 'absolute', top: '0', right: '0', width: '7px', height: '7px', background: 'var(--status-danger)', borderRadius: '50%' }} />
          </button>
          {isNotificationsOpen && (
            <div style={{ position: 'absolute', top: '44px', right: '-10px', width: '290px', background: '#ffffff', border: '1px solid #d1ddef', borderRadius: '10px', boxShadow: '0 8px 24px rgba(13,31,69,0.15)', zIndex: 50, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #e4ecf5', fontWeight: 700, fontSize: '0.875rem', color: '#0d1f45' }}>Notifications</div>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #e4ecf5', fontSize: '0.8rem' }}>
                <div style={{ fontWeight: 600, color: '#0d1f45' }}>Term 2 Reports Ready</div>
                <div style={{ color: '#4a6080', marginTop: '2px' }}>All assessments fully processed.</div>
              </div>
              <div style={{ padding: '12px 16px', fontSize: '0.8rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--status-danger)' }}>Welfare Alert — High Priority</div>
                <div style={{ color: '#4a6080', marginTop: '2px' }}>New trauma triage case logged.</div>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div style={{ position: 'relative' }}>
          <div className="profile-avatar"
            onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotificationsOpen(false); }}>
            OK
          </div>
          {isProfileOpen && (
            <div style={{ position: 'absolute', top: '48px', right: '0', width: '150px', background: '#ffffff', border: '1px solid #d1ddef', borderRadius: '10px', boxShadow: '0 8px 24px rgba(13,31,69,0.15)', zIndex: 50, overflow: 'hidden' }}>
              <div style={{ padding: '9px 16px', fontSize: '0.8rem', cursor: 'pointer', color: '#0d1f45' }}>My Profile</div>
              <div style={{ padding: '9px 16px', fontSize: '0.8rem', cursor: 'pointer', color: '#0d1f45' }}
                onClick={() => { setActiveItem('settings'); setIsProfileOpen(false); }}>Settings</div>
              <div style={{ borderTop: '1px solid #e4ecf5', margin: '2px 0' }} />
              <div style={{ padding: '9px 16px', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--status-danger)', fontWeight: 600 }}
                onClick={() => { setIsAuthenticated(false); setIsDecrypted(false); }}>Log Out</div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// ─── War Room / Dashboard ─────────────────────────────────────────────────────
const DashboardContent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://13.140.177.98:3000/dashboard/metrics', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    })
    .then(res => res.json())
    .then(json => {
      setData(json);
      setLoading(false);
    })
    .catch(err => {
      console.error('Failed to fetch dashboard metrics:', err);
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
      <div className="content-area" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(59, 130, 246, 0.2)', borderTopColor: 'var(--accent-blue)', animation: 'spin 1s linear infinite' }} />
          <h2 style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Loading Live Database Metrics...</h2>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="content-area animate-fade-in">
      {/* KPI Cards */}
      <div className="metrics-grid">
        <div className="glass-panel metric-card hover-lift">
          <div className="metric-header"><span>School Avg Z-Score</span><LineChart size={18} /></div>
          <div className="metric-value">{data.kpis.avgZScore.value}</div>
          <div className={`metric-trend ${data.kpis.avgZScore.trend === 'up' ? 'trend-up' : data.kpis.avgZScore.trend === 'down' ? 'trend-down' : ''}`}>
            {data.kpis.avgZScore.trend === 'up' ? <TrendingUp size={15} /> : data.kpis.avgZScore.trend === 'down' ? <TrendingDown size={15} /> : null}
            <span>{data.kpis.avgZScore.description}</span>
          </div>
        </div>
        <div className="glass-panel metric-card hover-lift">
          <div className="metric-header"><span>Overall Attendance</span><UserCheck size={18} /></div>
          <div className="metric-value">{data.kpis.attendance.value}</div>
          <div className={`metric-trend ${data.kpis.attendance.trend === 'up' ? 'trend-up' : data.kpis.attendance.trend === 'down' ? 'trend-down' : ''}`}>
            {data.kpis.attendance.trend === 'up' ? <TrendingUp size={15} /> : data.kpis.attendance.trend === 'down' ? <TrendingDown size={15} /> : null}
            <span>{data.kpis.attendance.description}</span>
          </div>
        </div>
        <div className="glass-panel metric-card hover-lift">
          <div className="metric-header"><span>Open Welfare Cases</span><ShieldAlert size={18} /></div>
          <div className="metric-value">{data.kpis.welfareCases.value}</div>
          <div className={`metric-trend ${data.kpis.welfareCases.trend === 'up' ? 'trend-down' : data.kpis.welfareCases.trend === 'down' ? 'trend-up' : ''}`} style={data.kpis.welfareCases.trend === 'down' ? { color: 'var(--status-success)' } : {}}>
            {data.kpis.welfareCases.trend === 'up' ? <TrendingUp size={15} /> : data.kpis.welfareCases.trend === 'down' ? <TrendingDown size={15} /> : null}
            <span>{data.kpis.welfareCases.description}</span>
          </div>
        </div>
      </div>

      {/* Chart + Alerts row */}
      <div className="dashboard-row">
        <div className="glass-panel hover-lift">
          <h3 className="section-title">Longitudinal Z-Score — Cohort F3</h3>
          <div className="chart-container">
            {data.performanceData.length === 0 ? (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                No performance data recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.performanceData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorZ" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#1d4ed8" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4ecf5" vertical={false} />
                  <XAxis dataKey="term" stroke="#8fa5c0" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#8fa5c0" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1ddef', borderRadius: '8px', boxShadow: '0 4px 12px rgba(13,31,69,0.12)' }}
                    itemStyle={{ color: '#0d1f45' }}
                    labelStyle={{ color: '#4a6080', fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="zScore" stroke="#1d4ed8" strokeWidth={2} fillOpacity={1} fill="url(#colorZ)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="glass-panel hover-lift">
          <h3 className="section-title">Early Warning System</h3>
          <div className="alert-list">
            {data.alerts.length === 0 ? (
              <div style={{ padding: '20px 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No active alerts.</div>
            ) : (
              data.alerts.map(alert => (
                <div key={alert.id} className={`alert-item ${alert.type}`}>
                  {alert.type === 'critical' ? <AlertCircle size={18} className="alert-icon" /> :
                   alert.type === 'warning'  ? <AlertTriangle size={18} className="alert-icon" /> :
                   <TrendingUp size={18} className="alert-icon" />}
                  <div className="alert-content">
                    <h4>{alert.title}</h4>
                    <p>{alert.message}</p>
                  </div>
                  <div className="alert-time">{alert.time}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Institutional Heatmap */}
      <InstitutionalHeatmap heatmapData={data.heatmapData} />
    </div>
  );
};

// ─── App Root ─────────────────────────────────────────────────────────────────
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeItem, setActiveItem]           = useState('war-room');
  const [isMobileOpen, setIsMobileOpen]       = useState(false);
  const [isDecrypted, setIsDecrypted]         = useState(false);
  const [userEmail, setUserEmail]             = useState('');
  const [currentUser, setCurrentUser]         = useState(null);

  const queryParams = new URLSearchParams(window.location.search);
  const isResetting = queryParams.get('reset') === 'true';
  const resetToken = queryParams.get('token');
  const resetEmail = queryParams.get('email');

  if (isResetting && resetToken && resetEmail) {
    return (
      <ResetPasswordScreen 
        token={resetToken} 
        email={resetEmail} 
        onResetComplete={() => {
          window.history.replaceState({}, document.title, window.location.pathname);
          window.location.reload();
        }} 
      />
    );
  }

  if (!isAuthenticated) return <LoginScreen onLogin={(user) => { 
    setIsAuthenticated(true); 
    setCurrentUser(user);
    setUserEmail(user?.email || ''); 
    if (user?.role !== 'Admin') {
      setActiveItem('teacher');
    }
  }} />;

  const renderContent = () => {
    const executiveViews = ['war-room', 'analytics', 'settings'];
    if (executiveViews.includes(activeItem)) {
      if (currentUser?.role !== 'Admin') {
        return (
          <div className="content-area" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
            <h2 style={{ color: 'var(--status-danger)' }}>Access Denied: Executive Privileges Required</h2>
          </div>
        );
      }
      if (!isDecrypted) {
        return <EncryptionBarrier userEmail={userEmail} onUnlock={() => setIsDecrypted(true)} />;
      }
    }

    switch (activeItem) {
      case 'war-room':   return <DashboardContent />;
      case 'teacher':    return <TeacherWorkstation />;
      case 'assessment': return <AssessmentManagement />;
      case 'attendance': return <AttendanceNotification />;
      case 'safe-space': return <WelfareCounseling />;
      case 'pathfinder': return <Pathfinder />;
      case 'analytics':  return <AnalyticsEngine />;
      case 'reports':    return <ReportingDocumentation />;
      case 'archive':    return <EducationalArchive />;
      case 'settings':   return <SettingsAudit />;
      default: return (
        <div className="content-area">
          <div className="glass-panel" style={{ display: 'flex', height: '200px', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{ color: 'var(--text-secondary)' }}>{activeItem} — coming soon</h2>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        activeItem={activeItem} setActiveItem={setActiveItem}
        isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen}
        currentUser={currentUser}
      />
      <main className="main-content">
        <TopBar
          activeItem={activeItem} setIsMobileOpen={setIsMobileOpen}
          setActiveItem={setActiveItem} setIsAuthenticated={setIsAuthenticated}
          setIsDecrypted={setIsDecrypted}
        />
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
