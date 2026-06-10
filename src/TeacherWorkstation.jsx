import React, { useState, useMemo } from 'react';
import { FileText, Save, Download, X, AlertTriangle, UserCheck } from 'lucide-react';

// Deterministic list generator so students stay the same for a specific subject
const generateStudentsForSubject = (subjectName) => {
  const hash = subjectName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const firstNames = ["Tanaka", "Chipo", "Farai", "Rudo", "Tendai", "Kudzai", "Nyasha", "Thabo", "Munashe", "Rutendo"];
  const lastNames = ["Moyo", "Ndlovu", "Sibanda", "Nyoni", "Phiri", "Ncube", "Dube", "Mutasa", "Chikore", "Banda"];
  
  // Generate 5-8 students based on the subject hash
  const count = 5 + (hash % 4);
  const classList = [];
  
  for (let i = 0; i < count; i++) {
    const fName = firstNames[(hash + i) % firstNames.length];
    const lName = lastNames[(hash + Math.floor(i * 1.5)) % lastNames.length];
    classList.push({
      id: `CT24-${hash % 100}${i}`,
      name: `${fName} ${lName}`,
      inClass: 0,
      monthly: 0,
      endTerm: 0
    });
  }
  
  return classList;
};

const CURRICULUM = {
  'O-Level (Forms 1-4)': {
    Sciences: ['Maths', 'Computer Science', 'Biology', 'Chemistry', 'Physics'],
    Commercials: ['Commerce', 'Accounts', 'Business Studies', 'Economics', 'Geography'],
    Arts: ['Shona', 'Ndebele', 'English', 'History', 'Heritage']
  },
  'A-Level (Forms 5-6)': {
    Sciences: ['Maths', 'Computer Science', 'Biology', 'Chemistry', 'Crop Science', 'Physics'],
    Commercials: ['Accounts', 'Business Studies', 'Economics', 'Geography'],
    Arts: ['Shona', 'English Literature', 'Ndebele', 'History']
  }
};

// Weightings
const W_IN_CLASS = 0.20;
const W_MONTHLY = 0.30;
const W_END_TERM = 0.50;

const TeacherWorkstation = () => {
  const [teacherProfile, setTeacherProfile] = useState(null);
  
  // Setup Form State
  const [setupName, setSetupName] = useState("");
  const [setupLevel, setSetupLevel] = useState("O-Level (Forms 1-4)");
  const [setupFormNumber, setSetupFormNumber] = useState("Form 1");
  const [setupStream, setSetupStream] = useState("Sciences");
  const [setupSubjects, setSetupSubjects] = useState([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [classDataCache, setClassDataCache] = useState({}); // Stores students per subject
  const [students, setStudents] = useState([]);
  const [reportModalData, setReportModalData] = useState(null);

  const availableSubjects = CURRICULUM[setupLevel][setupStream] || [];

  const handleSubjectToggle = (subject) => {
    setSetupSubjects(prev => 
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const handleLevelChange = (level) => {
    setSetupLevel(level);
    setSetupFormNumber(level.includes('O-Level') ? 'Form 1' : 'Form 5');
    setSetupSubjects([]); // Reset selections on level change
  };

  const handleSetupComplete = (e) => {
    e.preventDefault();
    if (!setupName || setupSubjects.length === 0) return;

    // Format strings: "Form 3 - Sciences: Physics"
    const formattedClasses = setupSubjects.map(sub => `${setupFormNumber} ${setupStream}: ${sub}`);

    setTeacherProfile({
      name: setupName,
      department: setupStream,
      subjects: formattedClasses
    });
    
    // Set initial class
    handleClassSwitch(formattedClasses[0], {});
  };

  const handleClassSwitch = (newClass, currentCache = classDataCache) => {
    // Save current students to cache if a class was already selected
    const updatedCache = { ...currentCache };
    if (selectedClass) {
      updatedCache[selectedClass] = students;
    }

    setSelectedClass(newClass);
    
    // Load existing students from cache or generate new ones
    if (updatedCache[newClass]) {
      setStudents(updatedCache[newClass]);
    } else {
      setStudents(generateStudentsForSubject(newClass));
    }
    
    setClassDataCache(updatedCache);
  };

  const handleMarkChange = (id, field, value) => {
    // Ensure value is between 0 and 100
    let numVal = parseInt(value, 10);
    if (isNaN(numVal)) numVal = 0;
    if (numVal > 100) numVal = 100;
    if (numVal < 0) numVal = 0;

    setStudents(prev => prev.map(student => {
      if (student.id === id) {
        return { ...student, [field]: numVal };
      }
      return student;
    }));
  };

  // Auto-calculation logic
  const processedStudents = useMemo(() => {
    // 1. Calculate weighted totals
    let data = students.map(s => {
      const weightedScore = (s.inClass * W_IN_CLASS) + (s.monthly * W_MONTHLY) + (s.endTerm * W_END_TERM);
      return { ...s, total: Math.round(weightedScore) };
    });

    // 2. Sort by total to calculate Rank
    data.sort((a, b) => b.total - a.total);
    data = data.map((s, index) => ({ ...s, rank: index + 1 }));

    // Re-sort back by Name or ID for the grid display
    data.sort((a, b) => a.name.localeCompare(b.name));
    return data;
  }, [students]);

  const classMean = useMemo(() => {
    if (processedStudents.length === 0) return 0;
    const sum = processedStudents.reduce((acc, s) => acc + s.total, 0);
    return Math.round(sum / processedStudents.length);
  }, [processedStudents]);

  const generateReport = (student) => {
    // Mock calculating Required Velocity to hit an 'A' grade (80% overall target)
    // Assuming this was Term 2, and Term 3 is purely the final exam (100% weight for that term)
    // Simplified logic: If total is < 80, how much extra do they need next term?
    const shortfall = 80 - student.total;
    const requiredVelocity = shortfall > 0 ? `+${shortfall}% improvement needed` : "On track for 'A' Grade";
    
    setReportModalData({
      ...student,
      mean: classMean,
      requiredVelocity,
      atRisk: student.total < 50
    });
  };

  if (!teacherProfile) {
    return (
      <div className="content-area animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
        <div className="glass-panel" style={{ maxWidth: '600px', width: '100%', margin: 'auto' }}>
          <h2 style={{ marginBottom: '8px' }}>Teacher Workstation Setup</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.875rem' }}>
            Configure your exact teaching load based on the official curriculum mappings.
          </p>
          
          <form onSubmit={handleSetupComplete} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>Full Name</label>
              <input 
                type="text" 
                className="mark-input" 
                style={{ width: '100%', textAlign: 'left' }}
                placeholder="e.g. Mrs. N. Dube" 
                value={setupName}
                onChange={e => setSetupName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>Academic Level</label>
                <select 
                  className="premium-select" 
                  style={{ width: '100%' }}
                  value={setupLevel} 
                  onChange={e => handleLevelChange(e.target.value)}
                >
                  {Object.keys(CURRICULUM).map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>Specific Form</label>
                <select 
                  className="premium-select" 
                  style={{ width: '100%' }}
                  value={setupFormNumber} 
                  onChange={e => setSetupFormNumber(e.target.value)}
                >
                  {setupLevel.includes('O-Level') ? (
                    <>
                      <option value="Form 1">Form 1</option>
                      <option value="Form 2">Form 2</option>
                      <option value="Form 3">Form 3</option>
                      <option value="Form 4">Form 4</option>
                    </>
                  ) : (
                    <>
                      <option value="Form 5">Form 5 (Lower 6th)</option>
                      <option value="Form 6">Form 6 (Upper 6th)</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>Department / Stream</label>
              <select 
                className="premium-select" 
                style={{ width: '100%' }}
                value={setupStream} 
                onChange={e => { setSetupStream(e.target.value); setSetupSubjects([]); }}
              >
                <option value="Sciences">Sciences</option>
                <option value="Commercials">Commercials</option>
                <option value="Arts">Arts / Languages</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.875rem', fontWeight: 500 }}>
                Select Subjects for {setupFormNumber} {setupStream}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', background: '#f3f4f6', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '4px' }}>
                {availableSubjects.map(subject => (
                  <label key={subject} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
                    <input 
                      type="checkbox" 
                      checked={setupSubjects.includes(subject)}
                      onChange={() => handleSubjectToggle(subject)}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--accent-blue)' }}
                    />
                    {subject}
                  </label>
                ))}
              </div>
              {setupSubjects.length === 0 && (
                <div style={{ color: 'var(--status-warning)', fontSize: '0.75rem', marginTop: '8px' }}>
                  Please select at least one subject to proceed.
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="action-button" 
              style={{ justifyContent: 'center', marginTop: '12px', opacity: setupSubjects.length === 0 ? 0.5 : 1, pointerEvents: setupSubjects.length === 0 ? 'none' : 'auto' }}
            >
              <UserCheck size={18} /> Initialize Workstation
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area animate-fade-in">
      <div className="teacher-header">
        <div className="teacher-info">
          <h2>Teacher Workstation</h2>
          <p>{teacherProfile.name} • {teacherProfile.department} Department</p>
        </div>
        
        <div className="class-selector">
          <select 
            className="premium-select" 
            value={selectedClass} 
            onChange={(e) => handleClassSwitch(e.target.value)}
          >
            {teacherProfile.subjects.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
          <button className="action-button">
            <Save size={18} /> Save Marks
          </button>
        </div>
      </div>

      <div className="spreadsheet-container hover-lift">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student Details</th>
              <th style={{textAlign: 'center'}}>In-Class (20%)</th>
              <th style={{textAlign: 'center'}}>Monthly (30%)</th>
              <th style={{textAlign: 'center'}}>End Term (50%)</th>
              <th style={{textAlign: 'center'}}>Weighted Total</th>
              <th style={{textAlign: 'center'}}>Class Rank</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {processedStudents.map((student) => (
              <tr key={student.id}>
                <td>
                  <span className="student-name">{student.name}</span>
                  <span className="student-id">{student.id}</span>
                </td>
                <td style={{textAlign: 'center'}}>
                  <input 
                    type="number" 
                    className="mark-input" 
                    value={student.inClass || ''} 
                    onChange={(e) => handleMarkChange(student.id, 'inClass', e.target.value)}
                  />
                </td>
                <td style={{textAlign: 'center'}}>
                  <input 
                    type="number" 
                    className="mark-input" 
                    value={student.monthly || ''} 
                    onChange={(e) => handleMarkChange(student.id, 'monthly', e.target.value)}
                  />
                </td>
                <td style={{textAlign: 'center'}}>
                  <input 
                    type="number" 
                    className="mark-input" 
                    value={student.endTerm || ''} 
                    onChange={(e) => handleMarkChange(student.id, 'endTerm', e.target.value)}
                  />
                </td>
                <td style={{textAlign: 'center'}} className="calc-cell">
                  {student.total}%
                </td>
                <td style={{textAlign: 'center'}} className="calc-cell">
                  {student.rank} / {processedStudents.length}
                </td>
                <td>
                  <button 
                    onClick={() => generateReport(student)}
                    className="icon-button" 
                    style={{color: 'var(--accent-blue)', display: 'flex', gap: '8px', fontSize: '0.875rem'}}
                  >
                    <FileText size={18} /> View Report
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '20px', color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between' }}>
        <span>Class Mean: <strong>{classMean}%</strong></span>
        <span>Auto-sync enabled</span>
      </div>

      {/* Digital Report Book Modal */}
      {reportModalData && (
        <div className="modal-overlay" onClick={() => setReportModalData(null)}>
          <div className="report-modal animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="report-header">
              <div className="school-branding">
                <h3>CT Tech's Pulse - Official Report</h3>
                <p>Term 2 Academic Record • {selectedClass}</p>
              </div>
              <button className="close-btn" onClick={() => setReportModalData(null)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="report-body">
              <div className="student-report-info">
                <div className="info-block">
                  <span>Student Name</span>
                  <strong>{reportModalData.name}</strong>
                </div>
                <div className="info-block">
                  <span>Student ID</span>
                  <strong>{reportModalData.id}</strong>
                </div>
                <div className="info-block">
                  <span>Class Rank</span>
                  <strong>{reportModalData.rank} out of {processedStudents.length}</strong>
                </div>
              </div>

              <table className="report-table">
                <thead>
                  <tr>
                    <th>Assessment Type</th>
                    <th>Weighting</th>
                    <th>Raw Score</th>
                    <th>Weighted Contribution</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>In-Class Checkpoints</td>
                    <td>20%</td>
                    <td>{reportModalData.inClass}%</td>
                    <td>{Math.round(reportModalData.inClass * W_IN_CLASS)}%</td>
                  </tr>
                  <tr>
                    <td>Monthly/Topic Tests</td>
                    <td>30%</td>
                    <td>{reportModalData.monthly}%</td>
                    <td>{Math.round(reportModalData.monthly * W_MONTHLY)}%</td>
                  </tr>
                  <tr>
                    <td>End of Term Examination</td>
                    <td>50%</td>
                    <td>{reportModalData.endTerm}%</td>
                    <td>{Math.round(reportModalData.endTerm * W_END_TERM)}%</td>
                  </tr>
                  <tr style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                    <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold' }}>Final Weighted Total:</td>
                    <td style={{ fontWeight: 'bold', color: 'var(--accent-blue)' }}>{reportModalData.total}%</td>
                  </tr>
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'right', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Class Average:</td>
                    <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{reportModalData.mean}%</td>
                  </tr>
                </tbody>
              </table>

              {reportModalData.atRisk && (
                <div className="velocity-warning">
                  <h4><AlertTriangle size={20} /> Academic Early Warning</h4>
                  <p>This student's overall performance is below the 50% threshold. The Required Velocity metric indicates a steep learning curve is needed. Intervention recommended.</p>
                </div>
              )}

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="info-block">
                  <span>Required Velocity (Target: 80%)</span>
                  <strong style={{ color: reportModalData.atRisk ? 'var(--status-warning)' : 'var(--status-success)' }}>
                    {reportModalData.requiredVelocity}
                  </strong>
                </div>
                <button className="action-button">
                  <Download size={18} /> Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherWorkstation;
