import React, { useState, useEffect } from 'react';
import { BookOpen, Award, FileText, CheckCircle, Clock } from 'lucide-react';
import { API_BASE_URL } from './config';

const StudentDashboard = ({ currentUser }) => {
  const [marks, setMarks] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const [marksRes, materialsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/assessments/my-marks`, { headers }),
          // Just fetching all materials for now, could filter by class later
          fetch(`${API_BASE_URL}/materials`, { headers }) 
        ]);

        if (marksRes.ok) setMarks(await marksRes.json());
        if (materialsRes.ok) setMaterials(await materialsRes.json());
      } catch (error) {
        console.error('Failed to fetch student data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="content-area" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>Loading...</div>;
  }

  return (
    <div className="content-area" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0d1f45', marginBottom: '8px' }}>Welcome back, {currentUser?.name}!</h2>
        <p style={{ color: '#4a6080', fontSize: '0.9rem' }}>Here is your personal academic overview.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        
        {/* Marks Section */}
        <div className="glass-panel hover-lift" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(59,130,246,0.1)', padding: '10px', borderRadius: '8px', color: '#3b82f6' }}>
              <Award size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0d1f45', margin: 0 }}>My Marks & Assessments</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {marks.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No assessments graded yet.</p>
            ) : (
              marks.map(mark => (
                <div key={mark.id} style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>{mark.assessment?.title || mark.assessment?.type}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{mark.assessment?.subject} • {new Date(mark.recorded_at).toLocaleDateString()}</div>
                    </div>
                    <div style={{ background: mark.score >= 50 ? '#dcfce7' : '#fee2e2', color: mark.score >= 50 ? '#166534' : '#991b1b', padding: '4px 10px', borderRadius: '20px', fontWeight: 700, fontSize: '0.9rem' }}>
                      {mark.score}%
                    </div>
                  </div>
                  {mark.teacher_feedback && (
                    <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '10px', padding: '10px', background: 'rgba(59,130,246,0.05)', borderRadius: '6px', borderLeft: '3px solid #3b82f6' }}>
                      <strong>Feedback:</strong> {mark.teacher_feedback}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Materials Section */}
        <div className="glass-panel hover-lift" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(16,185,129,0.1)', padding: '10px', borderRadius: '8px', color: '#10b981' }}>
              <BookOpen size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0d1f45', margin: 0 }}>Class Materials Feed</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {materials.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No class materials posted yet.</p>
            ) : (
              materials.map(mat => (
                <a key={mat.id} href={mat.google_drive_link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', transition: 'all 0.2s ease', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'center' }}
                       onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.1)'; }}
                       onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '8px', color: '#475569' }}>
                      <FileText size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem', marginBottom: '2px' }}>{mat.title}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{mat.class} • Posted by {mat.posted_by}</div>
                    </div>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
