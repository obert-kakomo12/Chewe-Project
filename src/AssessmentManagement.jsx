import React, { useState, useEffect, useMemo } from 'react';
import { ClipboardList, CheckCircle, TrendingUp, Search, PlusCircle, FileSpreadsheet, X, Trash2, CheckSquare } from 'lucide-react';
import { API_BASE_URL } from './config';

const statusBadge = (status) => {
  if (status === 'Graded')          return { bg: '#f0fdf4', color: '#065f46', border: '#6ee7b7' };
  if (status === 'Pending Marking') return { bg: '#fffbeb', color: '#92400e', border: '#fde68a' };
  return                                    { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
};

const getTodayDateString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const AssessmentManagement = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const fetchAssessments = () => {
    fetch(`${API_BASE_URL}/assessments`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    })
    .then(res => res.json())
    .then(data => {
      setAssessments(data);
      setLoading(false);
    })
    .catch(err => {
      console.error('Failed to fetch assessments:', err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  // Modal states
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New Assessment Form states
  const [formSubject, setFormSubject] = useState('Mathematics');
  const [formClass, setFormClass] = useState('Form 3A');
  const [formType, setFormType] = useState('Continuous Assessment');
  const [formDate, setFormDate] = useState(getTodayDateString());
  const [formStatus, setFormStatus] = useState('Scheduled');
  const [formAvgScore, setFormAvgScore] = useState('75');
  
  // Grading Form states
  const [gradeValue, setGradeValue] = useState('');

  // Search Filter
  const filteredAssessments = useMemo(() => {
    if (!searchQuery.trim()) return assessments;
    const q = searchQuery.toLowerCase();
    return assessments.filter(a =>
      a.id.toLowerCase().includes(q) ||
      a.subject.toLowerCase().includes(q) ||
      a.class.toLowerCase().includes(q) ||
      a.type.toLowerCase().includes(q) ||
      a.status.toLowerCase().includes(q)
    );
  }, [assessments, searchQuery]);

  // Dynamic KPI calculations
  const pendingGradedCount = useMemo(() => {
    return assessments.filter(a => a.status !== 'Graded').length;
  }, [assessments]);

  const avgGradedScore = useMemo(() => {
    const graded = assessments.filter(a => a.status === 'Graded' && a.avgScore !== '—');
    if (graded.length === 0) return '—';
    const sum = graded.reduce((acc, curr) => acc + parseInt(curr.avgScore), 0);
    return Math.round(sum / graded.length) + '%';
  }, [assessments]);

  const handleAddAssessment = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    const newAst = {
      subject: formSubject,
      class: formClass,
      type: formType,
      date: formDate,
      avgScore: formStatus === 'Graded' ? `${formAvgScore}%` : '—',
      status: formStatus
    };
    
    fetch(`${API_BASE_URL}/assessments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(newAst)
    })
    .then(res => res.json())
    .then(data => {
      setAssessments([data, ...assessments]);
      setIsNewModalOpen(false);
      // Reset Form
      setFormSubject('Mathematics');
      setFormClass('Form 3A');
      setFormType('Continuous Assessment');
      setFormDate(getTodayDateString());
      setFormStatus('Scheduled');
      setFormAvgScore('75');
    })
    .catch(err => {
      console.error(err);
      alert('Failed to create assessment.');
    })
    .finally(() => {
      setIsSubmitting(false);
    });
  };

  const handleDeleteAssessment = (dbId, id) => {
    fetch(`${API_BASE_URL}/assessments/${dbId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    })
    .then(() => {
      setAssessments(assessments.filter(a => a.id !== id));
    });
  };

  const handleGradingSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    const assessment = assessments.find(a => a.id === selectedAssessmentId);
    
    fetch(`${API_BASE_URL}/assessments/${assessment.dbId}/grade`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ avgScore: `${gradeValue}%` })
    })
    .then(res => res.json())
    .then(updated => {
      setAssessments(assessments.map(a => {
        if (a.dbId === updated.id) {
          return { ...a, status: 'Graded', avgScore: updated.avgScore };
        }
        return a;
      }));
      setIsGradeModalOpen(false);
      setGradeValue('');
      setSelectedAssessmentId(null);
    })
    .catch(err => {
      console.error(err);
      alert('Failed to submit grade.');
    })
    .finally(() => {
      setIsSubmitting(false);
    });
  };

  if (loading) {
    return (
      <div className="content-area" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(59, 130, 246, 0.2)', borderTopColor: 'var(--accent-blue)', animation: 'spin 1s linear infinite' }} />
          <h2 style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Loading Assessments...</h2>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="content-area animate-fade-in">
      <div className="teacher-header">
        <div className="teacher-info">
          <h2>Student Assessment Management</h2>
          <p>Computational engine for continuous assessments and examinations</p>
        </div>
        <button className="primary-button" onClick={() => setIsNewModalOpen(true)}>
          <PlusCircle size={16} /> New Assessment
        </button>
      </div>

      {/* KPIs */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '24px' }}>
        <div className="glass-panel metric-card hover-lift">
          <div className="metric-header"><span>Pending Graded</span><ClipboardList size={17} /></div>
          <div className="metric-value">{pendingGradedCount}</div>
          <div className="metric-trend trend-up"><CheckCircle size={14} /><span>Requires grading updates</span></div>
        </div>
        <div className="glass-panel metric-card hover-lift">
          <div className="metric-header"><span>Avg Class Score</span><TrendingUp size={17} /></div>
          <div className="metric-value">{avgGradedScore}</div>
          <div className="metric-trend trend-up"><TrendingUp size={14} /><span>Based on graded tasks</span></div>
        </div>
        <div className="glass-panel metric-card hover-lift">
          <div className="metric-header"><span>Total Assessments</span><FileSpreadsheet size={17} /></div>
          <div className="metric-value">{assessments.length}</div>
          <div className="metric-trend trend-up" style={{ color: 'var(--status-success)' }}>
            <span>Active in current term</span>
          </div>
        </div>
      </div>

      {/* Assessment table */}
      <div className="glass-panel hover-lift" style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 className="section-title" style={{ margin: 0 }}>Recent &amp; Upcoming Assessments</h3>
          <div className="search-bar" style={{ width: '240px' }}>
            <Search size={16} className="text-secondary" />
            <input 
              type="text" 
              placeholder="Search ID or subject…" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th><th>Subject</th><th>Class</th><th>Type</th><th>Date</th><th>Avg Score</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssessments.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px' }}>
                  No assessments found matching search query.
                </td>
              </tr>
            ) : (
              filteredAssessments.map(a => {
                const badge = statusBadge(a.status);
                return (
                  <tr key={a.id}>
                    <td data-label="ID" style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{a.id}</td>
                    <td data-label="Subject" style={{ fontWeight: 500 }}>{a.subject}</td>
                    <td data-label="Class" style={{ color: 'var(--text-secondary)' }}>{a.class}</td>
                    <td data-label="Type">{a.type}</td>
                    <td data-label="Date" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{a.date}</td>
                    <td data-label="Avg Score" style={{ fontWeight: 700 }}>{a.avgScore}</td>
                    <td data-label="Status">
                      <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700,
                        background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                        {a.status}
                      </span>
                    </td>
                    <td data-label="Actions">
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {a.status !== 'Graded' && (
                          <button 
                            onClick={() => {
                              setSelectedAssessmentId(a.id);
                              setGradeValue('');
                              setIsGradeModalOpen(true);
                            }} 
                            className="secondary-button" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem', gap: '4px' }}
                            title="Mark as Graded"
                          >
                            <CheckSquare size={13} /> Grade
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteAssessment(a.dbId, a.id)} 
                          className="icon-button" 
                          style={{ color: 'var(--status-danger)', padding: '4px' }}
                          title="Delete Assessment"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Create New Assessment Modal ─────────────────────────────────────── */}
      {isNewModalOpen && (
        <div className="modal-overlay" onClick={() => setIsNewModalOpen(false)}>
          <div className="report-modal animate-fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="report-header" style={{ padding: '16px 20px' }}>
              <div className="school-branding">
                <h3>Create New Assessment</h3>
                <p>Register a new continuous assessment or exam</p>
              </div>
              <button className="close-btn" onClick={() => setIsNewModalOpen(false)}><X size={22} /></button>
            </div>
            <div className="report-body" style={{ padding: '20px' }}>
              <form onSubmit={handleAddAssessment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>SUBJECT</label>
                  <select className="premium-select" style={{ width: '100%' }} value={formSubject} onChange={e => setFormSubject(e.target.value)}>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="English">English</option>
                    <option value="History">History</option>
                    <option value="Accounts">Accounts</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>CLASS</label>
                  <select className="premium-select" style={{ width: '100%' }} value={formClass} onChange={e => setFormClass(e.target.value)}>
                    <option value="Form 1A">Form 1A</option>
                    <option value="Form 2A">Form 2A</option>
                    <option value="Form 3A">Form 3A</option>
                    <option value="Form 3B">Form 3B</option>
                    <option value="Form 4A">Form 4A</option>
                    <option value="Form 4B">Form 4B</option>
                    <option value="Lower 6th">Lower 6th</option>
                    <option value="Upper 6th">Upper 6th</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ASSESSMENT TYPE</label>
                  <select className="premium-select" style={{ width: '100%' }} value={formType} onChange={e => setFormType(e.target.value)}>
                    <option value="Continuous Assessment">Continuous Assessment</option>
                    <option value="Mid-Term Exam">Mid-Term Exam</option>
                    <option value="Pop Quiz">Pop Quiz</option>
                    <option value="Final Exam">Final Exam</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>DUE DATE</label>
                  <input type="date" className="mark-input" style={{ width: '100%', textAlign: 'left' }} value={formDate} onChange={e => setFormDate(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>INITIAL STATUS</label>
                  <select className="premium-select" style={{ width: '100%' }} value={formStatus} onChange={e => {
                    setFormStatus(e.target.value);
                    if (e.target.value !== 'Graded') {
                      setFormAvgScore('—');
                    } else if (formAvgScore === '—') {
                      setFormAvgScore('75');
                    }
                  }}>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Pending Marking">Pending Marking</option>
                    <option value="Graded">Graded</option>
                  </select>
                </div>
                {formStatus === 'Graded' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>AVERAGE SCORE (%)</label>
                    <input type="number" min="0" max="100" className="mark-input" style={{ width: '100%', textAlign: 'left' }} placeholder="e.g. 75" value={formAvgScore === '—' ? '' : formAvgScore} onChange={e => setFormAvgScore(e.target.value)} required />
                  </div>
                )}
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" className="secondary-button" onClick={() => setIsNewModalOpen(false)}>Cancel</button>
                  <button type="submit" className="action-button" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Assessment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Grade Assessment Modal ─────────────────────────────────────────── */}
      {isGradeModalOpen && (
        <div className="modal-overlay" onClick={() => setIsGradeModalOpen(false)}>
          <div className="report-modal animate-fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="report-header" style={{ padding: '16px 20px' }}>
              <div className="school-branding">
                <h3>Mark Assessment as Graded</h3>
                <p>Submit average score to finalize grading</p>
              </div>
              <button className="close-btn" onClick={() => setIsGradeModalOpen(false)}><X size={22} /></button>
            </div>
            <div className="report-body" style={{ padding: '20px' }}>
              <form onSubmit={handleGradingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>AVERAGE SCORE (%)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    className="mark-input" 
                    style={{ width: '100%', textAlign: 'left' }} 
                    placeholder="e.g. 72" 
                    value={gradeValue} 
                    onChange={e => setGradeValue(e.target.value)} 
                    required 
                    autoFocus
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" className="secondary-button" onClick={() => setIsGradeModalOpen(false)}>Cancel</button>
                  <button type="submit" className="action-button" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save & Grade'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentManagement;
