import React, { useState, useMemo } from 'react';
import { FileText, Save, Download, X, AlertTriangle, UserCheck, Brain, RefreshCw, Plus } from 'lucide-react';
import EncryptionBarrier from './EncryptionBarrier';
import { API_BASE_URL } from './config';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Students are fetched from backend

// Curriculum is now dynamically fetched
const W_IN_CLASS = 0.20;
const W_MONTHLY  = 0.30;
const W_END_TERM = 0.50;

// AI comment helper is now routed through the backend NestJS service

// ─── Z-score helper ───────────────────────────────────────────────────────────
const calcZScore = (value, mean, stdDev) => {
  if (stdDev === 0) return 0;
  return ((value - mean) / stdDev).toFixed(2);
};

// ─── Component ────────────────────────────────────────────────────────────────
const TeacherWorkstation = () => {
  const currentUserStr = localStorage.getItem('currentUser');
  const currentUserRole = currentUserStr ? JSON.parse(currentUserStr).role : null;
  const isAdminOrExec = currentUserRole === 'Admin' || currentUserRole === 'Executive';

  const [teacherProfile,  setTeacherProfile]  = useState(null);
  const [viewMode,        setViewMode]        = useState('academics'); // 'academics' or 'attendance'
  const [registerDate,    setRegisterDate]    = useState(new Date().toISOString().split('T')[0]);
  const [attendanceSubmitted, setAttendanceSubmitted] = useState(false);
  const [selectedClass,   setSelectedClass]   = useState('');
  const [classDataCache,  setClassDataCache]  = useState({});
  const [students,        setStudents]        = useState([]);
  const [reportModalData, setReportModalData] = useState(null);
  const [editedComment,   setEditedComment]   = useState('');
  const [isGeneratingComment, setIsGeneratingComment] = useState(false);
  const [topicName,       setTopicName]       = useState('');
  const [topicDate,       setTopicDate]       = useState(new Date().toISOString().split('T')[0]);
  const [exercisesCount,  setExercisesCount]  = useState('');
  const [maxScore,        setMaxScore]        = useState('100');
  const [topicLink,       setTopicLink]       = useState('');
  const [pastTopics,      setPastTopics]      = useState([]);
  const [isEndTermUnlocked, setIsEndTermUnlocked] = useState(false);
  const [showEncryptionBarrier, setShowEncryptionBarrier] = useState(false);
  const [encryptionPin, setEncryptionPin] = useState('');
  
  // Dossier State
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [dossierStudent, setDossierStudent] = useState(null);
  const [dossierData, setDossierData] = useState(null);

  const fetchAiComment = async (studentData) => {
    setIsGeneratingComment(true);
    try {
      const payload = {
        studentName: studentData.name,
        total: studentData.total,
        subject: selectedClass.split(' - ')[0],
        atRisk: studentData.total < 50
      };
      const res = await fetch(`${API_BASE_URL}/ai/report-comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setEditedComment(data.response);
      setReportModalData(prev => ({ ...prev, aiComment: data.response }));
    } catch (err) {
      console.error('Failed to generate AI comment', err);
      setEditedComment('Error generating comment.');
    }
    setIsGeneratingComment(false);
  };
  const [aiInstruction,   setAiInstruction]   = useState('');
  const [adjusting,       setAdjusting]       = useState(false);
  const [isSubmitting,    setIsSubmitting]    = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [newStudentData, setNewStudentData] = useState({ name: '', email: '' });
  const [classMaterials, setClassMaterials] = useState([]);
  
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [homeroomClasses, setHomeroomClasses] = useState([]);
  const [loadingConfig, setLoadingConfig] = useState(true);

  React.useEffect(() => {
    const fetchConfig = async () => {
      try {
        const currentUserStr = localStorage.getItem('currentUser');
        if (!currentUserStr) return;
        const currentUser = JSON.parse(currentUserStr);
        
        const token = localStorage.getItem('access_token');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const isAdminOrExec = currentUser.role === 'Admin' || currentUser.role === 'Executive';
        
        const [courseRes, classRes] = await Promise.all([
          fetch(isAdminOrExec 
            ? `${API_BASE_URL}/academics/courses` 
            : `${API_BASE_URL}/academics/courses/teacher/${currentUser.id}`, { headers }),
          fetch(`${API_BASE_URL}/academics/classrooms`, { headers })
        ]);
        
        let fetchedCourses = [];
        let fetchedClasses = [];
        
        if (courseRes.ok) fetchedCourses = await courseRes.json();
        if (classRes.ok) fetchedClasses = await classRes.json();
        
        setTeacherCourses(fetchedCourses);
        
        const myHomerooms = isAdminOrExec 
          ? fetchedClasses 
          : fetchedClasses.filter(c => c.class_teacher?.id === currentUser.id);
        setHomeroomClasses(myHomerooms);
        
        if (isAdminOrExec) {
          // Admin/Exec: build class list from courses + any classrooms not already covered
          const courseSubjectList = fetchedCourses.map(c => `${c.subject?.name || 'Subject'} - ${c.class_room?.name || 'Class'}`);
          // Also include all classrooms directly (so admin can browse any class even with no course assignment)
          const classroomDirectList = fetchedClasses
            .filter(cls => !fetchedCourses.some(c => c.class_room?.id === cls.id))
            .map(cls => `Homeroom - ${cls.name}`);
          const homeroomList = fetchedClasses
            .filter(cls => fetchedCourses.some(c => c.class_room?.id === cls.id) === false)
            .map(h => `Homeroom - ${h.name}`);

          // Full list: courses first, then uncovered classrooms as homeroom entries
          const combinedList = [...courseSubjectList, ...classroomDirectList];

          // If there are courses, use course subjects; if only classrooms exist, list as homeroom
          const finalList = combinedList.length > 0 ? combinedList
            : fetchedClasses.map(cls => `Homeroom - ${cls.name}`);

          setTeacherProfile({
            name: `${currentUser.name} (Admin View)`,
            department: 'Administration',
            subjects: finalList,
            courses: fetchedCourses
          });
          if (finalList.length > 0) {
            handleClassSwitch(finalList[0], {});
          }
        } else {
          // Regular teacher
          if (fetchedCourses.length > 0 || myHomerooms.length > 0) {
            const subjectsList = fetchedCourses.map(c => `${c.subject?.name || 'Subject'} - ${c.class_room?.name || 'Class'}`);
            const homeroomList = myHomerooms.map(h => `Homeroom - ${h.name}`);
            const combinedList = [...subjectsList, ...homeroomList];
            
            setTeacherProfile({
              name: currentUser.name,
              department: 'Academic',
              subjects: combinedList,
              courses: fetchedCourses
            });
            
            if (combinedList.length > 0) {
              handleClassSwitch(combinedList[0], {});
            }
          }
          // else: leave teacherProfile null → shows "No Assignments Yet" for regular teachers
        }
      } catch (err) {
        console.error('Failed to load teacher config', err);
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchConfig();
  }, []);

  React.useEffect(() => {
    if (viewMode === 'materials' && selectedClass && teacherProfile) {
      const selectedCourse = teacherProfile.courses?.find(c => `${c.subject?.name || 'Subject'} - ${c.class_room?.name || 'Class'}` === selectedClass);
      if (!selectedCourse) return;
      
      const fetchMaterials = async () => {
        try {
          const token = localStorage.getItem('access_token');
          const res = await fetch(`${API_BASE_URL}/materials/course/${selectedCourse.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            setClassMaterials(await res.json());
          }
        } catch (err) {
          console.error('Failed to load class materials', err);
        }
      };
      fetchMaterials();
    }
  }, [viewMode, selectedClass, teacherProfile]);

  React.useEffect(() => {
    if (viewMode === 'attendance' && selectedClass) {
      const fetchAttendance = async () => {
        try {
          const token = localStorage.getItem('access_token');
          const actualClassName = selectedClass.includes('Homeroom - ') ? selectedClass.replace('Homeroom - ', '') : (selectedClass.split(' - ')[1] || selectedClass);
          const courseObj = teacherProfile?.courses?.find(c => `${c.subject?.name} - ${c.class_room?.name}` === selectedClass);
          const courseQuery = courseObj ? `&courseId=${courseObj.id}` : '';
          
          const attRes = await fetch(`${API_BASE_URL}/attendance/records?date=${registerDate}&className=${encodeURIComponent(actualClassName)}${courseQuery}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (attRes.ok) {
            const records = await attRes.json();
            setStudents(prev => prev.map(student => {
              const record = records.find(r => r.student && r.student.id === student.id);
              return {
                ...student,
                attendanceStatus: record ? record.status : undefined,
                attendanceRemark: record ? record.notes : ''
              };
            }));
          }
        } catch (err) {
          console.error('Failed to load historical attendance', err);
        }
      };
      fetchAttendance();
    }
  }, [viewMode, selectedClass, registerDate]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudentData.name || isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/academics/classes/${encodeURIComponent(selectedClass)}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newStudentData.name,
          email: newStudentData.email || `${newStudentData.name.toLowerCase().replace(/\s+/g, '.')}@chewe.com`
        })
      });
      
      if (res.ok) {
        const newStudent = await res.json();
        setStudents(prev => [...prev, newStudent]);
        
        const updatedCache = { ...classDataCache };
        if (updatedCache[selectedClass]) {
          updatedCache[selectedClass] = [...updatedCache[selectedClass], newStudent];
        } else {
          updatedCache[selectedClass] = [newStudent];
        }
        setClassDataCache(updatedCache);
        
        alert('Student added successfully!');
        setIsAddStudentModalOpen(false);
        setNewStudentData({ name: '', email: '' });
      } else {
        alert('Failed to enroll student.');
      }
    } catch (err) {
      console.error('Failed to create backend student account', err);
      alert('Network error while enrolling student.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const handleSaveMarks = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      const payload = {
        className: selectedClass,
        marks: processedStudents.map(s => ({
          studentId: s.dbId || s.id,
          inClass: s.inClass,
          monthly: s.monthly,
          endTerm: s.endTerm,
          total: viewMode === 'topics' ? s.topicScore : s.total
        }))
      };
      
      if (viewMode === 'topics') {
        if (!topicName) {
          alert('Please enter a Topic Name');
          setIsSubmitting(false);
          return;
        }
        payload.topicName = topicName;
        payload.topicDate = topicDate;
        payload.topicExercises = parseInt(exercisesCount) || 0;
        payload.topicMaxScore = parseInt(maxScore) || 100;
        
        const courseObj = teacherProfile?.courses?.find(c => `${c.subject?.name} - ${c.class_room?.name}` === selectedClass);
        if (courseObj) {
          payload.courseId = courseObj.id;
        }
        payload.topicLink = topicLink;
        payload.teacherName = teacherProfile?.name;
      }

      const res = await fetch(`${API_BASE_URL}/assessments/marks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('Marks saved successfully to the database.');
      } else {
        alert('Failed to save marks.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoCalculate = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const actualClassName = selectedClass.includes(' - ') ? selectedClass.split(' - ')[1] : selectedClass;
      const res = await fetch(`${API_BASE_URL}/assessments/topic-averages?className=${encodeURIComponent(actualClassName)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const averages = await res.json();
        setStudents(prev => prev.map(s => {
          const avg = averages[s.dbId || s.id];
          if (avg !== undefined) {
            // Apply the average to both inClass and monthly for simplicity, or let them choose.
            // A standard approach is auto-filling inClass and monthly.
            return { ...s, inClass: avg, monthly: avg };
          }
          return s;
        }));
        alert('Successfully auto-calculated and filled In-Class and Monthly marks from past Topic tests!');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to auto-calculate marks');
    }
  };

  const handleSubmitRegister = async () => {
    const unmarkedStudents = processedStudents.filter(s => !s.attendanceStatus);
    if (unmarkedStudents.length > 0) {
      alert('Error: Student left unmarked. Please ensure all students have an attendance status.');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/attendance/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          className: selectedClass,
          date: registerDate,
          records: processedStudents.map(s => ({
            studentId: s.dbId || s.id,
            status: s.attendanceStatus,
            remark: s.attendanceRemark
          }))
        })
      });
      if (res.ok) {
        setAttendanceSubmitted(true);
        setTimeout(() => setAttendanceSubmitted(false), 3000);
      } else {
        alert('Failed to submit register.');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting register.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = async () => {
    const modalElement = document.querySelector('.report-modal');
    if (!modalElement) return;
    
    try {
      const canvas = await html2canvas(modalElement, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${reportModalData.name.replace(/\s+/g, '_')}_Report.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
      alert('Failed to generate PDF');
    }
  };


  const handleClassSwitch = async (newClass, currentCache = classDataCache) => {
    setSelectedClass(newClass);
    const actualClassName = newClass.includes(' - ') ? newClass.split(' - ')[1] : newClass;
    
    if (currentCache[newClass]) {
      setStudents(currentCache[newClass]);
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/academics/classes/${encodeURIComponent(actualClassName)}/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const fetchedStudents = await res.json();
        setStudents(fetchedStudents);
        setClassDataCache({ ...currentCache, [newClass]: fetchedStudents });
        
        // Fetch past topics
        try {
          const tRes = await fetch(`${API_BASE_URL}/assessments/topics/${encodeURIComponent(actualClassName)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (tRes.ok) {
            const fetchedTopics = await tRes.json();
            setPastTopics(fetchedTopics);
          }
        } catch (e) { console.error(e); }
      }
    } catch (err) {
      console.error('Failed to fetch class students', err);
    }
  };

  const handleMarkChange = (id, field, value) => {
    let n = parseInt(value, 10);
    if (isNaN(n)) n = 0;
    const currentMax = (field === 'topicScore') ? (parseInt(maxScore, 10) || 100) : 100;
    n = Math.min(currentMax, Math.max(0, n));
    setStudents(prev => prev.map(s => s.id === id ? { ...s, [field]: n } : s));
  };

  const handleAttendanceChange = (id, field, value) => {
    setProcessedStudents(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const openDossier = async (student) => {
    setDossierStudent(student);
    setDossierData(null);
    setShowDossierModal(true);
    
    const actualClassName = selectedClass.includes('Homeroom - ') ? selectedClass.replace('Homeroom - ', '') : (selectedClass.split(' - ')[1] || selectedClass);
    const courseObj = teacherProfile?.courses?.find(c => `${c.subject?.name} - ${c.class_room?.name}` === selectedClass);
    if (!courseObj) return;

    try {
      const dbId = student.id.replace(/\D/g, '');
      const res = await fetch(`${API_BASE_URL}/assessments/dossier/${dbId}/${courseObj.id}?className=${encodeURIComponent(actualClassName)}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDossierData(data);
      }
    } catch (err) {
      console.error('Failed to load dossier', err);
    }
  };

  // ── Processed students with weighted total, rank, Z-score ──────────────────
  const processedStudents = useMemo(() => {
    let data = students.map(s => ({
      ...s,
      total: Math.round(((s.inClass || 0) * W_IN_CLASS) + ((s.monthly || 0) * W_MONTHLY) + ((s.endTerm || 0) * W_END_TERM)),
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
    setEditedComment('Generating AI Insight...');
    setReportModalData({ ...student, mean: classMean, requiredVelocity, atRisk: student.total < 50, aiComment: '' });
    fetchAiComment(student);
  };

  // ── Setup screen ────────────────────────────────────────────────────────────
  if (loadingConfig) {
    return <div className="content-area" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading Workstation Config...</div>;
  }

  if (!teacherProfile) {
    // Only regular teachers (no assignments) see this
    const isAdminOrExec = (() => {
      try { const u = JSON.parse(localStorage.getItem('currentUser') || '{}'); return u.role === 'Admin' || u.role === 'Executive'; } catch { return false; }
    })();
    return (
      <div className="content-area animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div className="glass-panel" style={{ maxWidth: '600px', width: '100%', textAlign: 'center', padding: '40px' }}>
          <AlertTriangle size={48} style={{ color: 'var(--status-warning)', margin: '0 auto 16px auto' }} />
          {isAdminOrExec ? (
            <>
              <h2 style={{ marginBottom: '16px' }}>No Classes Configured Yet</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                No classrooms have been set up in the system yet. Go to <strong>Executive Operations → Class &amp; Subject Builder</strong> to create classes and assign teachers first.
              </p>
            </>
          ) : (
            <>
              <h2 style={{ marginBottom: '16px' }}>No Assignments Yet</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                You have not been assigned to any courses or homerooms. Please wait for the Executive Administrator to assign your subjects and classes.
              </p>
            </>
          )}
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
          {viewMode === 'academics' || viewMode === 'topics' ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {viewMode === 'topics' && (
                <>
                  <input 
                    type="text"
                    className="premium-select"
                    placeholder="Topic Studied (e.g., Algebra)"
                    style={{ padding: '6px 12px', height: '100%', width: '200px' }}
                    value={topicName}
                    onChange={(e) => setTopicName(e.target.value)}
                  />
                  <input 
                    type="date" 
                    className="premium-select" 
                    style={{ padding: '6px 12px', height: '100%' }}
                    value={topicDate} 
                    onChange={(e) => setTopicDate(e.target.value)} 
                  />
                  <input 
                    type="number" 
                    className="premium-select" 
                    placeholder="Exercises (e.g. 5)"
                    style={{ padding: '6px 12px', height: '100%', width: '150px' }}
                    value={exercisesCount} 
                    onChange={(e) => setExercisesCount(e.target.value)} 
                  />
                  <input 
                    type="number" 
                    className="premium-select" 
                    placeholder="Max Score (e.g. 30)"
                    style={{ padding: '6px 12px', height: '100%', width: '150px' }}
                    value={maxScore} 
                    onChange={(e) => setMaxScore(e.target.value)} 
                  />
                  <input 
                    type="text" 
                    className="premium-select" 
                    placeholder="Material Link (Optional)"
                    style={{ padding: '6px 12px', height: '100%', width: '200px' }}
                    value={topicLink} 
                    onChange={(e) => setTopicLink(e.target.value)} 
                  />
                </>
              )}
              {viewMode === 'academics' && (
                <button className="action-button" onClick={handleAutoCalculate} style={{ background: '#4f46e5', marginRight: '8px' }}>
                  Auto-Calculate from Topics
                </button>
              )}
              <button className="action-button" onClick={handleSaveMarks} disabled={isSubmitting}>
                <Save size={16} /> {isSubmitting ? 'Saving...' : 'Save Marks'}
              </button>
            </div>
          ) : viewMode === 'attendance' ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input 
                type="date" 
                className="premium-select" 
                style={{ padding: '6px 12px', height: '100%' }}
                value={registerDate} 
                onChange={(e) => setRegisterDate(e.target.value)} 
              />
              <button className="action-button" onClick={handleSubmitRegister} disabled={isSubmitting}>
                <Save size={16} /> {isSubmitting ? 'Submitting...' : 'Submit Register'}
              </button>
            </div>
          ) : null}
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
          Term Report Entry
        </button>
        <button 
          onClick={() => setViewMode('topics')}
          style={{ 
            padding: '8px 16px', 
            borderRadius: '4px', 
            border: 'none', 
            cursor: 'pointer',
            fontWeight: 500,
            background: viewMode === 'topics' ? 'var(--accent-blue)' : '#e5e7eb',
            color: viewMode === 'topics' ? '#fff' : 'var(--text-secondary)'
          }}
        >
          Topic / Fortnight Tests
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
        {!selectedClass.startsWith('Homeroom') && (
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
        )}
        {selectedClass.startsWith('Homeroom') && (
          <button 
            onClick={() => setViewMode('manage-class')}
            style={{ 
              padding: '8px 16px', 
              borderRadius: '4px', 
              border: 'none', 
              cursor: 'pointer',
              fontWeight: 500,
              background: viewMode === 'manage-class' ? 'var(--accent-blue)' : '#e5e7eb',
              color: viewMode === 'manage-class' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            Manage Class
          </button>
        )}
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
                  <td data-label="Student">
                    <span className="student-name">{student.name}</span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.id}</div>
                  </td>
                  <td data-label="In-Class (20%)" style={{ textAlign: 'center' }}>
                    <input type="number" className="mark-input" value={student.inClass || ''}
                      onChange={e => handleMarkChange(student.id, 'inClass', e.target.value)} />
                  </td>
                  <td data-label="Monthly (30%)" style={{ textAlign: 'center' }}>
                    <input type="number" className="mark-input" value={student.monthly || ''}
                      onChange={e => handleMarkChange(student.id, 'monthly', e.target.value)} />
                  </td>
                  <td data-label="End Term (50%)" style={{ textAlign: 'center' }}>
                    <div style={{ position: 'relative' }}>
                      <input type="number" className="mark-input" value={student.endTerm || ''}
                        readOnly={student.endTerm > 0 && !isEndTermUnlocked}
                        onClick={() => {
                          if (student.endTerm > 0 && !isEndTermUnlocked) {
                            setShowEncryptionBarrier(true);
                          }
                        }}
                        onChange={e => handleMarkChange(student.id, 'endTerm', e.target.value)}
                        style={{ background: (student.endTerm > 0 && !isEndTermUnlocked) ? 'rgba(0,0,0,0.05)' : 'white' }}
                      />
                      {(student.endTerm > 0 && !isEndTermUnlocked) && (
                        <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                          🔒
                        </div>
                      )}
                    </div>
                  </td>
                  <td data-label="Total" style={{ textAlign: 'center' }} className="calc-cell">{student.total}%</td>
                  <td data-label="Z-Score" style={{ textAlign: 'center', fontWeight: 700, color: zColor }}>
                    {student.zScore > 0 ? '+' : ''}{student.zScore}
                  </td>
                  <td data-label="Rank" style={{ textAlign: 'center' }} className="calc-cell">
                    {student.rank}/{processedStudents.length}
                  </td>
                  <td data-label="Report" style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => generateReport(student)} className="icon-button"
                      style={{ color: 'var(--accent-blue)', gap: '6px', fontSize: '0.8rem', display: 'flex' }}>
                      <FileText size={16} /> View
                    </button>
                    <button 
                      className="secondary-button" 
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      onClick={() => openDossier(student)}
                    >
                      📄 Dossier
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          </table>
        ) : viewMode === 'topics' ? (
          <>
          <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            {pastTopics.length > 0 && (
              <select 
                className="premium-select" 
                style={{ padding: '8px 16px', borderRadius: '4px' }}
                onChange={async (e) => {
                  const topic = e.target.value;
                  if (!topic) {
                    setTopicName('');
                    return;
                  }
                  setTopicName(topic);
                  const selectedTopicObj = pastTopics.find(t => t.topicName === topic);
                  if (selectedTopicObj) {
                    setTopicDate(selectedTopicObj.date.split('T')[0]);
                    setExercisesCount(selectedTopicObj.exercisesCount || '');
                    setMaxScore(selectedTopicObj.maxScore || '100');
                  } else {
                    setExercisesCount('');
                    setMaxScore('100');
                  }
                  
                  try {
                    const token = localStorage.getItem('access_token');
                    const actualClassName = selectedClass.includes(' - ') ? selectedClass.split(' - ')[1] : selectedClass;
                    const res = await fetch(`${API_BASE_URL}/assessments/topic-marks/${encodeURIComponent(actualClassName)}/${encodeURIComponent(topic)}`, {
                      headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                      const marks = await res.json();
                      setStudents(prev => prev.map(s => ({
                        ...s,
                        topicScore: marks[s.dbId || s.id] !== undefined ? marks[s.dbId || s.id] : (s.topicScore || 0)
                      })));
                    }
                  } catch(err) { console.error(err); }
                }}
              >
                <option value="">-- Load Past Topic --</option>
                {pastTopics.map((t, i) => (
                  <option key={i} value={t.topicName}>{t.topicName} ({t.date.split('T')[0]})</option>
                ))}
              </select>
            )}
          </div>
          <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th style={{ textAlign: 'center' }}>Topic Score / {maxScore || 100}</th>
            </tr>
          </thead>
          <tbody>
            {processedStudents.map(student => (
              <tr key={student.id}>
                <td data-label="Student">
                  <span className="student-name">{student.name}</span>
                  <span className="student-id">{student.id}</span>
                </td>
                <td data-label="Topic Score / 100" style={{ textAlign: 'center' }}>
                  <input type="number" className="mark-input" value={student.topicScore || ''}
                    onChange={e => handleMarkChange(student.id, 'topicScore', e.target.value)} />
                </td>
              </tr>
            ))}
          </tbody>
          </table>
          </>
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
                  <td data-label="Student Details">
                    <span className="student-name">{student.name}</span>
                    <span className="student-id">{student.id}</span>
                  </td>
                  <td data-label="Attendance Status">
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
                  <td data-label="Remarks">
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
        ) : viewMode === 'manage-class' ? (
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h3 style={{ marginTop: 0 }}>Class Management</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  You are the Class Teacher for {selectedClass}. Here you can view your official class roster and monitor broadsheet progress.
                </p>
              </div>
              {isAdminOrExec && (
                <button className="primary-button" onClick={() => setIsAddStudentModalOpen(true)}>
                  <Plus size={16} /> Add Student
                </button>
              )}
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Fee Status</th>
                  <th>Overall Average</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}>
                    <td data-label="Student Name">{s.name}</td>
                    <td data-label="ID">{s.id}</td>
                    <td data-label="Fee Status">
                      <span style={{ 
                        background: s.feeStatus === 'FULL' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                        color: s.feeStatus === 'FULL' ? '#10b981' : '#ef4444', 
                        padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600 
                      }}>{s.feeStatus || 'FULL'}</span>
                    </td>
                    <td data-label="Overall Average">{s.average !== undefined ? s.average : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '24px' }}>
            <h3 style={{ marginTop: 0 }}>Post Class Material</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Paste a Google Drive link to share study materials with {selectedClass}.
            </p>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (isSubmitting) return;
              setIsSubmitting(true);
              const title = e.target.title.value;
              const link = e.target.link.value;
              const token = localStorage.getItem('access_token');
              try {
                const selectedCourse = teacherProfile.courses?.find(c => `${c.subject?.name || 'Subject'} - ${c.class_room?.name || 'Class'}` === selectedClass);
                if (!selectedCourse) return;

                await fetch(`${API_BASE_URL}/materials`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                  body: JSON.stringify({ title, google_drive_link: link, course: { id: selectedCourse.id }, posted_by: teacherProfile.name })
                });
                alert('Material posted successfully!');
                e.target.reset();
                // Refresh list
                const fresh = await fetch(`${API_BASE_URL}/materials/course/${selectedCourse.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (fresh.ok) setClassMaterials(await fresh.json());
              } catch (err) {
                alert('Failed to post material');
              } finally {
                setIsSubmitting(false);
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
            
            <div style={{ marginTop: '32px' }}>
              <h4 style={{ color: '#0d1f45', marginBottom: '16px' }}>Previously Posted Materials</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {classMaterials.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No materials posted yet for this class.</p>
                ) : (
                  classMaterials.map(mat => (
                    <div key={mat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ color: '#3b82f6' }}><FileText size={18} /></div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>{mat.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(mat.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <a href={mat.google_drive_link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>Open Link</a>
                    </div>
                  ))
                )}
              </div>
            </div>
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
                    <td data-label="Assessment">In-Class Checkpoints</td><td data-label="Weight">20%</td>
                    <td data-label="Raw">{reportModalData.inClass}%</td>
                    <td data-label="Contribution">{Math.round(reportModalData.inClass * W_IN_CLASS)}%</td>
                  </tr>
                  <tr>
                    <td data-label="Assessment">Monthly / Topic Tests</td><td data-label="Weight">30%</td>
                    <td data-label="Raw">{reportModalData.monthly}%</td>
                    <td data-label="Contribution">{Math.round(reportModalData.monthly * W_MONTHLY)}%</td>
                  </tr>
                  <tr>
                    <td data-label="Assessment">End of Term Examination</td><td data-label="Weight">50%</td>
                    <td data-label="Raw">{reportModalData.endTerm}%</td>
                    <td data-label="Contribution">{Math.round(reportModalData.endTerm * W_END_TERM)}%</td>
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
                <button className="action-button" onClick={handleDownloadPDF}>
                  <Download size={15} /> Export PDF
                </button>
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
                    <Brain size={15} /> AI Comment Assistant
                  </div>
                  <button className="icon-button"
                    style={{ fontSize: '0.7rem', gap: '5px', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}
                    title="Regenerate suggestion"
                    disabled={isGeneratingComment}
                    onClick={() => { setEditedComment('Generating AI Insight...'); fetchAiComment(reportModalData); }}>
                    <RefreshCw size={13} className={isGeneratingComment ? "spin" : ""} /> {isGeneratingComment ? "Generating..." : "Regenerate"}
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
                  <button className="secondary-button" onClick={() => fetchAiComment(reportModalData)} disabled={isGeneratingComment}>
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

      {/* ── Add Student Modal ────────────────────────────────────────────── */}
      {isAddStudentModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddStudentModalOpen(false)}>
          <div className="glass-panel animate-fade-in" style={{ width: '400px', background: '#fff' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Add New Student to {selectedClass}</h3>
              <button className="icon-button" onClick={() => setIsAddStudentModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddStudent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 500 }}>Full Name</label>
                <input type="text" className="mark-input" style={{ width: '100%', textAlign: 'left' }}
                  value={newStudentData.name} onChange={e => setNewStudentData({...newStudentData, name: e.target.value})} required placeholder="e.g. Tendai Moyo" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 500 }}>Email Address (Optional)</label>
                <input type="email" className="mark-input" style={{ width: '100%', textAlign: 'left' }}
                  value={newStudentData.email} onChange={e => setNewStudentData({...newStudentData, email: e.target.value})} placeholder="Leaves blank for auto-generation" />
              </div>
              <button type="submit" className="primary-button" style={{ marginTop: '10px', justifyContent: 'center' }} disabled={isSubmitting}>
                {isSubmitting ? 'Enrolling...' : 'Create & Enroll Student'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Dossier Modal */}
      {showDossierModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '600px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Consultation Dossier</h3>
              <button onClick={() => setShowDossierModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-muted)' }}>✕</button>
            </div>
            
            {dossierStudent && (
              <div style={{ marginBottom: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{dossierStudent.name}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{dossierStudent.id} &nbsp;·&nbsp; {activeClass}</div>
              </div>
            )}

            {!dossierData ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Gathering records...</div>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '24px' }}>
                  <div style={{ padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Average Grade</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: dossierData.averageGrade >= 50 ? 'var(--status-success)' : 'var(--status-danger)' }}>
                      {dossierData.averageGrade}%
                    </div>
                  </div>
                  <div style={{ padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subject Attendance</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: dossierData.attendanceRate >= 85 ? 'var(--status-success)' : 'var(--status-warning)' }}>
                      {dossierData.attendanceRate}%
                    </div>
                  </div>
                </div>

                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Academic History</h4>
                <div style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '20px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <table className="data-table" style={{ margin: 0, fontSize: '0.85rem' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#f8fafc' }}>
                      <tr>
                        <th style={{ padding: '8px 12px' }}>Topic</th>
                        <th style={{ padding: '8px 12px' }}>Date</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dossierData.pastTopics.length === 0 ? (
                        <tr><td colSpan="3" style={{ textAlign: 'center', padding: '15px', color: 'var(--text-muted)' }}>No tests recorded yet.</td></tr>
                      ) : dossierData.pastTopics.map((t, i) => (
                        <tr key={i}>
                          <td style={{ padding: '8px 12px', fontWeight: 500 }}>{t.topicName}</td>
                          <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{new Date(t.date).toLocaleDateString()}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>{t.score}/{t.maxScore}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Absences & Lates</h4>
                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <table className="data-table" style={{ margin: 0, fontSize: '0.85rem' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#f8fafc' }}>
                      <tr>
                        <th style={{ padding: '8px 12px' }}>Date</th>
                        <th style={{ padding: '8px 12px' }}>Status</th>
                        <th style={{ padding: '8px 12px' }}>Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dossierData.absentOrLateDays.length === 0 ? (
                        <tr><td colSpan="3" style={{ textAlign: 'center', padding: '15px', color: 'var(--status-success)' }}>Perfect attendance!</td></tr>
                      ) : dossierData.absentOrLateDays.map((r, i) => (
                        <tr key={i}>
                          <td style={{ padding: '8px 12px' }}>{new Date(r.date).toLocaleDateString()}</td>
                          <td style={{ padding: '8px 12px' }}>
                            <span style={{ 
                              padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700,
                              background: r.status === 'Absent' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                              color: r.status === 'Absent' ? 'var(--status-danger)' : 'var(--status-warning)'
                            }}>
                              {r.status}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{r.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="secondary-button" onClick={() => window.print()} disabled={!dossierData}>
                🖨️ Print Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherWorkstation;
