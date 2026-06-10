import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  ShieldAlert, 
  LineChart, 
  Settings, 
  Bell, 
  Search,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  AlertTriangle,
  UserCheck,
  ClipboardList,
  FileText,
  Database
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import TeacherWorkstation from './TeacherWorkstation';
import LoginScreen from './LoginScreen';
import Pathfinder from './Pathfinder';
import AnalyticsEngine from './AnalyticsEngine';
import SettingsAudit from './SettingsAudit';
import AssessmentManagement from './AssessmentManagement';
import AttendanceNotification from './AttendanceNotification';
import WelfareCounseling from './WelfareCounseling';
import ReportingDocumentation from './ReportingDocumentation';
import EducationalArchive from './EducationalArchive';

// Mock Data for the Dashboard
const mockPerformanceData = [
  { term: 'Term 1 (F1)', zScore: 0.1 },
  { term: 'Term 2 (F1)', zScore: 0.2 },
  { term: 'Term 3 (F1)', zScore: 0.15 },
  { term: 'Term 1 (F2)', zScore: -0.1 },
  { term: 'Term 2 (F2)', zScore: -0.3 },
  { term: 'Term 3 (F2)', zScore: 0.0 },
  { term: 'Term 1 (F3)', zScore: 0.4 },
  { term: 'Term 2 (F3)', zScore: 0.6 },
];

const mockAlerts = [
  {
    id: 1,
    type: 'critical',
    title: 'Sudden Drop Detected',
    message: '5 Form 3 students showed >1.2 Z-score drop across 3 subjects.',
    time: '10 mins ago',
    icon: AlertCircle
  },
  {
    id: 2,
    type: 'warning',
    title: 'Attendance Bottleneck',
    message: 'Form 4 Physics attendance dropped below 85% this week.',
    time: '2 hours ago',
    icon: AlertTriangle
  },
  {
    id: 3,
    type: 'info',
    title: 'Positive Outlier',
    message: 'John Doe (F2) consistently scoring >1.5 IQR above Q3.',
    time: '1 day ago',
    icon: TrendingUp
  }
];

const Sidebar = ({ activeItem, setActiveItem }) => {
  const navItems = [
    { id: 'war-room', label: 'Executive War Room', icon: LayoutDashboard },
    { id: 'teacher', label: 'Teacher Workstation', icon: Users },
    { id: 'assessment', label: 'Assessment Management', icon: ClipboardList },
    { id: 'attendance', label: 'Attendance & Notification', icon: UserCheck },
    { id: 'safe-space', label: 'Counseling Safe Space', icon: ShieldAlert },
    { id: 'pathfinder', label: 'Level 3 Streaming', icon: GraduationCap },
    { id: 'analytics', label: 'AI Analytics Engine', icon: LineChart },
    { id: 'reports', label: 'Reporting & Docs', icon: FileText },
    { id: 'archive', label: 'Educational Archive', icon: Database },
    { id: 'settings', label: 'Settings & Audit', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="pulse-dot"></div>
        CT Pulse
      </div>
      <nav>
        {navItems.map((item) => (
          <div 
            key={item.id}
            className={`nav-item ${activeItem === item.id ? 'active' : ''}`}
            onClick={() => setActiveItem(item.id)}
          >
            <item.icon size={20} />
            {item.label}
          </div>
        ))}
      </nav>
    </aside>
  );
};

const TopBar = () => {
  return (
    <header className="topbar">
      <div className="topbar-title">War Room Overview</div>
      <div className="topbar-actions">
        <button className="icon-button">
          <Search size={20} />
        </button>
        <button className="icon-button">
          <Bell size={20} />
        </button>
        <div className="profile-avatar">P</div>
      </div>
    </header>
  );
};

const DashboardContent = () => {
  return (
    <div className="content-area animate-fade-in">
      <div className="metrics-grid">
        <div className="glass-panel metric-card hover-lift">
          <div className="metric-header">
            <span>School Avg Z-Score</span>
            <LineChart size={20} className="text-secondary" />
          </div>
          <div className="metric-value">+0.42</div>
          <div className="metric-trend trend-up">
            <TrendingUp size={16} />
            <span>0.15 since last term</span>
          </div>
        </div>

        <div className="glass-panel metric-card hover-lift">
          <div className="metric-header">
            <span>Overall Attendance</span>
            <UserCheck size={20} className="text-secondary" />
          </div>
          <div className="metric-value">94.8%</div>
          <div className="metric-trend trend-down">
            <TrendingDown size={16} />
            <span>1.2% from last week</span>
          </div>
        </div>

        <div className="glass-panel metric-card hover-lift">
          <div className="metric-header">
            <span>Open Welfare Cases</span>
            <ShieldAlert size={20} className="text-secondary" />
          </div>
          <div className="metric-value">12</div>
          <div className="metric-trend trend-down">
            <TrendingDown size={16} />
            <span>3 resolved this week</span>
          </div>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="glass-panel hover-lift">
          <h3 className="section-title">Longitudinal Performance (Cohort F3)</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockPerformanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorZScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="term" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1d2d', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="zScore" stroke="#3b82f6" fillOpacity={1} fill="url(#colorZScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel hover-lift">
          <h3 className="section-title">Early Warning System</h3>
          <div className="alert-list">
            {mockAlerts.map(alert => (
              <div key={alert.id} className={`alert-item ${alert.type}`}>
                <alert.icon size={20} className="alert-icon" />
                <div className="alert-content">
                  <h4>{alert.title}</h4>
                  <p>{alert.message}</p>
                </div>
                <div className="alert-time">{alert.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeItem, setActiveItem] = useState('war-room');

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
      <main className="main-content">
        <TopBar />
        {activeItem === 'war-room' ? (
          <DashboardContent />
        ) : activeItem === 'teacher' ? (
          <TeacherWorkstation />
        ) : activeItem === 'assessment' ? (
          <AssessmentManagement />
        ) : activeItem === 'attendance' ? (
          <AttendanceNotification />
        ) : activeItem === 'safe-space' ? (
          <WelfareCounseling />
        ) : activeItem === 'pathfinder' ? (
          <Pathfinder />
        ) : activeItem === 'analytics' ? (
          <AnalyticsEngine />
        ) : activeItem === 'reports' ? (
          <ReportingDocumentation />
        ) : activeItem === 'archive' ? (
          <EducationalArchive />
        ) : activeItem === 'settings' ? (
          <SettingsAudit />
        ) : (
          <div className="content-area">
            <div className="glass-panel" style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              <h2>{activeItem} module is under construction...</h2>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
