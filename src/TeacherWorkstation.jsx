import React, { useState, useMemo } from 'react';
import { FileText, Save, Download, X, AlertTriangle, UserCheck, PenLine, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from './config';

// ─── Student generator ────────────────────────────────────────────────────────
// ... (student generator remains the same)
const generateStudentsForSubject = (subjectName) => {
  const hash = subjectName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const fNames = ['Tanaka','Chipo','Farai','Rudo','Tendai','Kudzai','Nyasha','Thabo','Munashe','Rutendo'];
  const lNames = ['Moyo','Ndlovu','Sibanda','Nyoni','Phiri','Ncube','Dube','Mutasa','Chikore','Banda'];
  const count = 5 + (hash % 4);
  return Array.from({ length: count }, (_, i) => ({
    id:      `CT24-${String(hash % 100).padStart(2,'0')}${i}`,
    name:    `${fNames[(hash + i) % fNames.length]} ${lNames[(hash + Math.floor(i * 1.5)) % lNames.length]}`,
    inClass: 0, monthly: 0, endTerm: 0,
    attendanceStatus: 'Present', attendanceRemark: '',
  }));
};

// ─── Curriculum ───────────────────────────────────────────────────────────────
const CURRICULUM = {
  'O-Level (Forms 1-4)': {
    Sciences:    ['Maths','Computer Science','Biology','Chemistry','Physics'],
    Commercials: ['Commerce','Accounts','Business Studies','Economics','Geography'],
    Arts:        ['Shona','Ndebele','English','History','Heritage'],
  },
  'A-Level (Forms 5-6)': {
    Sciences:    ['Maths','Computer Science','Biology','Chemistry','Crop Science','Physics'],
    Commercials: ['Accounts','Business Studies','Economics','Geography'],
    Arts:        ['Shona','English Literature','Ndebele','History'],
  },
};

const W_IN_CLASS = 0.20;
const W_MONTHLY  = 0.30;
const W_END_TERM = 0.50;

// ─── Comment Generator ───────────────────────────────────────────────────────
const AI_COMMENTS = {
  excellent: [
    'Demonstrates exceptional aptitude and consistent mastery across all assessment tiers. Continue to set the benchmark for the class.',
    'Outstanding academic performance. Displays a deep understanding of core concepts and applies them with precision.',
    'A model student — persistent effort and intellectual curiosity are clearly reflected in these results.',
  ],
  good: [
    'Shows solid understanding of the subject material. A focused revision strategy heading into the next term will consolidate this progress.',
    'Performs commendably across all assessment types. Identifying one or two weaker topic areas will help push further.',
    'Good foundational understanding evident. Recommend targeted practice on areas where marks dip below class average.',
  ],
  atRisk: [
    'Performance is below the required threshold. Immediate intervention is recommended — a structured study plan and additional support sessions should be arranged.',
    'Significant gaps in core concepts are present. Teacher-facilitated one-on-one sessions and parental communication are strongly advised this term.',
    'Current trajectory places this student in the Critical Zone. Counseling and academic mentorship should be prioritised before the end of term.',
  ],
};

const generateAiComment = (total) => {
  const pool = total >= 75 ? AI_COMMENTS.excellent
             : total >= 50 ? AI_COMMENTS.good
             : AI_COMMENTS.atRisk;
  return pool[Math.floor(Math.random() * pool.length)];
};

// ─── Z-score helper ───────────────────────────────────────────────────────────
const calcZScore = (value, mean, stdDev) => {
  if (stdDev === 0) return 0;
  return ((value - mean) / stdDev).toFixed(2);
};

// ─── Component ────────────────────────────────────────────────────────────────
const TeacherWorkstation = () => {
  const [teacherProfile,  setTeacherProfile]  = useState(null);
  const [viewMode,        setViewMode]        = useState('academics'); // 'academics' or 'attendance'
  const [attendanceSubmitted, setAttendanceSubmitted] = useState(false);
  const [setupName,       setSetupName]       = useState('');
  const [setupLevel,      setSetupLevel]      = useState('O-Level (Forms 1-4)');
  const [setupFormNumber, setSetupFormNumber] = useState('Form 1');
  const [setupStream,     setSetupStream]     = useState('Sciences');
  const [setupSubjects,   setSetupSubjects]   = useState([]);
  const [selectedClass,   setSelectedClass]   = useState('');
  const [classDataCache,  setClassDataCache]  = useState({});
  const [students,        setStudents]        = useState([]);
  const [reportModalData, setReportModalData] = useState(null);
  const [editedComment,   setEditedComment]   = useState('');
  const [aiInstruction,   setAiInstruction]   = useState('');
  const [adjusting,       setAdjusting]       = useState(false);

  const handleAdjustCommentWithAi = () => {
    if (!reportModalData) return;
    setAdjusting(true);
    fetch(`${API_BASE_URL}/assessments/ai-comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({
        studentName: reportModalData.name,
        score: reportModalData.total,
        userPrompt: aiInstruction
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data && data.comment) {
        setEditedComment(data.comment);
      }
      setAdjusting(false);
    })
    .catch(err => {
      console.error('Failed to adjust comment with AI:', err);
      setAdjusting(false);
    });
  };

  const availableSubjects = CURRICULUM[setupLevel]?.[setupStream] || [];

  const handleSubjectToggle = (s) =>
    setSetupSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleLevelChange = (level) => {
    setSetupLevel(level);
    setSetupFormNumber(level.includes('O-Level') ? 'Form 1' : 'Form 5');
    setSetupSubjects([]);
  };

  const handleSetupComplete = (e) => {
    e.preventDefault();
    if (!setupName || setupSubjects.length === 0) return;
    const classes = setupSubjects.map(s => `${setupFormNumber} ${setupStream}: ${s}`);
    setTeacherProfile({ name: setupName, department: setupStream, subjects: classes });
    handleClassSwitch(classes[0], {});
  };

  const handleClassSwitch = (newClass, currentCache = classDataCache) => {
    const updatedCache = { ...currentCache };
    if (selectedClass) updatedCache[selectedClass] = students;
    setSelectedClass(newClass);
    setStudents(updatedCache[newClass] || generateStudentsForSubject(newClass));
    setClassDataCache(updatedCache);
  };

  const handleMarkChange = (id, field, value) => {
    let n = parseInt(value, 10);
    if (isNaN(n)) n = 0;
    n = Math.min(100, Math.max(0, n));
    setStudents(prev => prev.map(s => s.id === id ? { ...s, [field]: n } : s));
  };

  const handleAttendanceChange = (id, field, value) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  // ── Processed students with weighted total, rank, Z-score ──────────────────
  const processedStudents = useMemo(() => {
    let data = students.map(s => ({
      ...s,
      total: Math.round((s.inClass * W_IN_CLASS) + (s.monthly * W_MONTHLY) + (s.endTerm * W_END_TERM)),
    }));

    // Mean & stdDev for Z-score
    const totals = data.map(s => s.total);
    const mean   = totals.length ? totals.reduce((a, b) => a + b, 0) / totals.length : 0;
    const stdDev = totals.length
      ? Math.sqrt(totals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / totals.length)
      : 0;

    // Sort by total for rank
    data.sort((a, b) => b.total - a.total);
    data = data.map((s, i) => ({
      ...s,
      rank:   i + 1,
      zScore: parseFloat(calcZScore(s.total, mean, stdDev)),
    }));

    data.sort((a, b) => a.name.localeCompare(b.name));
    return data;
  }, [students]);

  const classMean = useMemo(() => {
    if (!processedStudents.length) return 0;
    return Math.round(processedStudents.reduce((a, s) => a + s.total, 0) / processedStudents.length);
  }, [processedStudents]);

  const generateReport = (student) => {
    const shortfall = 80 - student.total;
    const requiredVelocity = shortfall > 0 ? `+${shortfall}% improvement needed to reach A grade` : "On track for 'A' Grade ✓";
    const aiComment = generateAiComment(student.total);
    setEditedComment(aiComment);
    setReportModalData({ ...student, mean: classMean, requiredVelocity, atRisk: student.total < 50, aiComment });
  };

  // ── Setup screen ────────────────────────────────────────────────────────────
  if (!teacherProfile) {
    return (
      <div className="content-area animate-fade-in" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '600px', width: '100%' }}>
          <h2 style={{ marginBottom: '6px' }}>Teacher Workstation Setup</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.875rem' }}>
            Configure your teaching load based on official curriculum mappings.
          </p>

          <form onSubmit={handleSetupComplete} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Full Name</label>
              <input type="text" className="mark-input" style={{ width: '100%', textAlign: 'left' }}
                placeholder="e.g. Mrs. N. Dube" value={setupName} onChange={e => setSetupName(e.target.value)} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Academic Level</label>
                <select className="premium-select" style={{ width: '100%' }} value={setupLevel} onChange={e => handleLevelChange(e.target.value)}>
                  {Object.keys(CURRICULUM).map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Specific Form</label>
                <select className="premium-select" style={{ width: '100%' }} value={setupFormNumber} onChange={e => setSetupFormNumber(e.target.value)}>
                  {setupLevel.includes('O-Level')
                    ? ['Form 1','Form 2','Form 3','Form 4'].map(f => <option key={f}>{f}</option>)
                    : ['Form 5','Form 6'].map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Department / Stream</label>
              <select className="premium-select" style={{ width: '100%' }} value={setupStream}
                onChange={e => { setSetupStream(e.target.value); setSetupSubjects([]); }}>
                {Object.keys(CURRICULUM[setupLevel]).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Subjects — {setupFormNumber} {setupStream}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '10px', background: '#f0f4f8', border: '1.5px solid var(--border-color)', padding: '16px', borderRadius: '8px' }}>
                {availableSubjects.map(subject => (
                  <label key={subject} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
                    <input type="checkbox" checked={setupSubjects.includes(subject)} onChange={() => handleSubjectToggle(subject)}
                      style={{ width: '15px', height: '15px', accentColor: 'var(--accent-blue)' }} />
                    {subject}
                  </label>
                ))}
              </div>
              {setupSubjects.length === 0 && (
                <p style={{ color: 'var(--status-warning)', fontSize: '0.75rem', marginTop: '8px' }}>
                  Select at least one subject to proceed.
                </p>
              )}
            </div>

            <button type="submit" className="action-button"
              style={{ justifyContent: 'center', opacity: setupSubjects.length === 0 ? 0.45 : 1, pointerEvents: setupSubjects.length === 0 ? 'none' : 'auto' }}>
              <UserCheck size={17} /> Initialize Workstation
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Main mark-entry screen ──────────────────────────────────────────────────
  return (
    <div className="content-area animate-fade-in">
      <div className="teacher-header">
        <div className="teacher-info">
          <h2>Teacher Workstation</h2>
          <p>{teacherProfile.name} · {teacherProfile.department} Department</p>
        </div>
        <div className="class-selector">
          <select className="premium-select" value={selectedClass} onChange={e => handleClassSwitch(e.target.value)}>
            {teacherProfile.subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {viewMode === 'academics' ? (
            <button className="action-button"><Save size={16} /> Save Marks</button>
          ) : (
            <button className="action-button" onClick={() => {
              setAttendanceSubmitted(true);
              setTimeout(() => setAttendanceSubmitted(false), 3000);
            }}>
              <Save size={16} /> Submit Register
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button 
          onClick={() => setViewMode('academics')}
          style={{ 
            padding: '8px 16px', 
            borderRadius: '4px', 
            border: 'none', 
            cursor: 'pointer',
            fontWeight: 500,
            background: viewMode === 'academics' ? 'var(--accent-blue)' : '#e5e7eb',
            color: viewMode === 'academics' ? '#fff' : 'var(--text-secondary)'
          }}
        >
          Academics
        </button>
        <button 
          onClick={() => setViewMode('attendance')}
          style={{ 
            padding: '8px 16px', 
            borderRadius: '4px', 
            border: 'none', 
            cursor: 'pointer',
            fontWeight: 500,
            background: viewMode === 'attendance' ? 'var(--accent-blue)' : '#e5e7eb',
            color: viewMode === 'attendance' ? '#fff' : 'var(--text-secondary)'
          }}
        >
          Attendance Register
        </button>
        <button 
          onClick={() => setViewMode('materials')}
          style={{ 
            padding: '8px 16px', 
            borderRadius: '4px', 
            border: 'none', 
            cursor: 'pointer',
            fontWeight: 500,
            background: viewMode === 'materials' ? 'var(--accent-blue)' : '#e5e7eb',
            color: viewMode === 'materials' ? '#fff' : 'var(--text-secondary)'
          }}
        >
          Class Materials
        </button>
      </div>

      {attendanceSubmitted && (
        <div className="animate-fade-in" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--status-success)', padding: '12px', borderRadius: '4px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
           <UserCheck size={18} /> Register successfully submitted and synced with Notification Engine.
        </div>
      )}

      <div className="spreadsheet-container hover-lift">
        {viewMode === 'academics' ? (
          <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th style={{ textAlign: 'center' }}>In-Class (20%)</th>
              <th style={{ textAlign: 'center' }}>Monthly (30%)</th>
              <th style={{ textAlign: 'center' }}>End Term (50%)</th>
              <th style={{ textAlign: 'center' }}>Total</th>
              <th style={{ textAlign: 'center' }}>Z-Score</th>
              <th style={{ textAlign: 'center' }}>Rank</th>
              <th>Report</th>
            </tr>
          </thead>
          <tbody>
            {processedStudents.map(student => {
              const zColor = student.zScore > 0.5 ? 'var(--status-success)'
                           : student.zScore < -0.5 ? 'var(--status-danger)'
                           : 'var(--status-warning)';
              return (
                <tr key={student.id}>
                  <td>
                    <span className="student-name">{student.name}</span>
                    <span className="student-id">{student.id}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <input type="number" className="mark-input" value={student.inClass || ''}
                      onChange={e => handleMarkChange(student.id, 'inClass', e.target.value)} />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <input type="number" className="mark-input" value={student.monthly || ''}
                      onChange={e => handleMarkChange(student.id, 'monthly', e.target.value)} />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <input type="number" className="mark-input" value={student.endTerm || ''}
                      onChange={e => handleMarkChange(student.id, 'endTerm', e.target.value)} />
                  </td>
                  <td style={{ textAlign: 'center' }} className="calc-cell">{student.total}%</td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: zColor }}>
                    {student.zScore > 0 ? '+' : ''}{student.zScore}
                  </td>
                  <td style={{ textAlign: 'center' }} className="calc-cell">
                    {student.rank}/{processedStudents.length}
                  </td>
                  <td>
                    <button onClick={() => generateReport(student)} className="icon-button"
                      style={{ color: 'var(--accent-blue)', gap: '6px', fontSize: '0.8rem', display: 'flex' }}>
                      <FileText size={16} /> View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          </table>
        ) : viewMode === 'attendance' ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Details</th>
                <th style={{width: '300px'}}>Attendance Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {processedStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <span className="student-name">{student.name}</span>
                    <span className="student-id">{student.id}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['Present', 'Absent', 'Late'].map(status => (
                        <button
                          key={status}
                          onClick={() => handleAttendanceChange(student.id, 'attendanceStatus', status)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            border: '1px solid',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            background: student.attendanceStatus === status 
                              ? (status === 'Present' ? 'rgba(16, 185, 129, 0.2)' : status === 'Absent' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)')
                              : 'transparent',
                            borderColor: student.attendanceStatus === status
                              ? (status === 'Present' ? 'var(--status-success)' : status === 'Absent' ? 'var(--status-danger)' : 'var(--status-warning)')
                              : 'var(--border-color)',
                            color: student.attendanceStatus === status
                              ? (status === 'Present' ? 'var(--status-success)' : status === 'Absent' ? 'var(--status-danger)' : 'var(--status-warning)')
                              : 'var(--text-secondary)'
                          }}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td>
                    <input 
                      type="text" 
                      className="mark-input" 
                      placeholder="Add note..."
                      style={{ width: '100%', textAlign: 'left' }}
                      value={student.attendanceRemark || ''} 
                      onChange={(e) => handleAttendanceChange(student.id, 'attendanceRemark', e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '24px' }}>
            <h3 style={{ marginTop: 0 }}>Post Class Material</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Paste a Google Drive link to share study materials with {selectedClass}.
            </p>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const title = e.target.title.value;
              const link = e.target.link.value;
              const token = localStorage.getItem('access_token');
              try {
                await fetch('http://localhost:3000/materials', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                  body: JSON.stringify({ title, google_drive_link: link, class: selectedClass, posted_by: teacherProfile.name })
                });
                alert('Material posted successfully!');
                e.target.reset();
              } catch (err) {
                alert('Failed to post material');
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600 }}>Title / Description</label>
                <input name="title" type="text" className="mark-input" style={{ width: '100%', textAlign: 'left' }} placeholder="e.g. Chapter 3 Notes" required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600 }}>Google Drive Link</label>
                <input name="link" type="url" className="mark-input" style={{ width: '100%', textAlign: 'left' }} placeholder="https://drive.google.com/..." required />
              </div>
              <button type="submit" className="action-button" style={{ alignSelf: 'flex-start' }}>Post Material</button>
            </form>
          </div>
        )}
      </div>

      <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        {viewMode === 'academics' && <span>Class Mean: <strong style={{ color: 'var(--text-primary)' }}>{classMean}%</strong></span>}
        <span style={{ color: 'var(--status-success)' }}>● Auto-sync enabled</span>
      </div>

      {/* ── Digital Report Book Modal ──────────────────────────────────────── */}
      {reportModalData && (
        <div className="modal-overlay" onClick={() => setReportModalData(null)}>
          <div className="report-modal animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="report-header">
              <div className="school-branding">
                <h3>CT Tech's Pulse — Official Report</h3>
                <p>Term 2 Academic Record · {selectedClass}</p>
              </div>
              <button className="close-btn" onClick={() => setReportModalData(null)}><X size={22} /></button>
            </div>

            <div className="report-body">
              {/* Student info */}
              <div className="student-report-info">
                <div className="info-block"><span>Student</span><strong>{reportModalData.name}</strong></div>
                <div className="info-block"><span>ID</span><strong>{reportModalData.id}</strong></div>
                <div className="info-block"><span>Z-Score</span>
                  <strong style={{ color: reportModalData.zScore > 0 ? 'var(--status-success)' : 'var(--status-danger)' }}>
                    {reportModalData.zScore > 0 ? '+' : ''}{reportModalData.zScore}
                  </strong>
                </div>
                <div className="info-block"><span>Rank</span>
                  <strong>{reportModalData.rank} / {processedStudents.length}</strong>
                </div>
              </div>

              {/* Marks breakdown */}
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Assessment</th><th>Weight</th><th>Raw</th><th>Contribution</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>In-Class Checkpoints</td><td>20%</td>
                    <td>{reportModalData.inClass}%</td>
                    <td>{Math.round(reportModalData.inClass * W_IN_CLASS)}%</td>
                  </tr>
                  <tr>
                    <td>Monthly / Topic Tests</td><td>30%</td>
                    <td>{reportModalData.monthly}%</td>
                    <td>{Math.round(reportModalData.monthly * W_MONTHLY)}%</td>
                  </tr>
                  <tr>
                    <td>End of Term Examination</td><td>50%</td>
                    <td>{reportModalData.endTerm}%</td>
                    <td>{Math.round(reportModalData.endTerm * W_END_TERM)}%</td>
                  </tr>
                  <tr style={{ background: 'var(--accent-blue-light)' }}>
                    <td colSpan="3" style={{ textAlign: 'right', fontWeight: 700 }}>Final Weighted Total:</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{reportModalData.total}%</td>
                  </tr>
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Class Average:</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{reportModalData.mean}%</td>
                  </tr>
                </tbody>
              </table>

              {/* Required Velocity */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#f0f4f8', borderRadius: '8px', marginBottom: '16px', flexWrap: 'wrap', gap: '10px', border: '1px solid var(--border-color)' }}>
                <div className="info-block" style={{ margin: 0 }}>
                  <span>Required Velocity (Target: 80%)</span>
                  <strong style={{ fontSize: '0.9rem', color: reportModalData.atRisk ? 'var(--status-warning)' : 'var(--status-success)' }}>
                    {reportModalData.requiredVelocity}
                  </strong>
                </div>
                <button className="action-button"><Download size={15} /> Export PDF</button>
              </div>

              {reportModalData.atRisk && (
                <div className="velocity-warning" style={{ marginBottom: '16px' }}>
                  <h4><AlertTriangle size={16} /> Academic Early Warning</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Performance is below the 50% threshold. Immediate intervention is recommended.
                  </p>
                </div>
              )}

              {/* ── Comment Assistant ──────────────────────────────────────────── */}
              <div style={{ background: '#f0f6ff', border: '1.5px solid #bfdbfe', borderRadius: '8px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-blue)' }}>
                    <PenLine size={15} /> Comment Assistant
                  </div>
                  <button className="icon-button"
                    style={{ fontSize: '0.7rem', gap: '5px', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}
                    title="Regenerate suggestion"
                    onClick={() => setEditedComment(generateAiComment(reportModalData.total))}>
                    <RefreshCw size={13} /> Regenerate
                  </button>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Suggested comment based on marks. Edit before approving.
                </p>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    placeholder="Instruct AI (e.g. 'more encouragement', 'warn about finals')..."
                    value={aiInstruction}
                    onChange={e => setAiInstruction(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #bfdbfe',
                      outline: 'none',
                      background: '#ffffff',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <button
                    onClick={handleAdjustCommentWithAi}
                    disabled={adjusting}
                    className="action-button"
                    style={{ padding: '6px 12px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                  >
                    {adjusting ? 'Adjusting...' : 'Adjust with AI'}
                  </button>
                </div>
                <textarea
                  className="comment-box"
                  value={editedComment}
                  onChange={e => setEditedComment(e.target.value)}
                />
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end' }}>
                  <button className="secondary-button" onClick={() => setEditedComment(generateAiComment(reportModalData.total))}>
                    Discard
                  </button>
                  <button className="action-button" style={{ padding: '7px 14px' }}>
                    Approve Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherWorkstation;
