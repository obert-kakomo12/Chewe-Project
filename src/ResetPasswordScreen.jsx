import React, { useState } from 'react';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';
import CTLogo from './CTLogo';

const ResetPasswordScreen = ({ token, email, onResetComplete }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`http://13.140.177.98:3000/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed');
      }

      setSuccess('Password successfully reset! Returning to login...');
      setTimeout(() => {
        onResetComplete();
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: 'linear-gradient(135deg, #050d1a 0%, #0a1628 50%, #0d1f45 100%)',
      alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      <div className="glass-panel animate-fade-in" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 1, background: 'rgba(13,31,69,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <CTLogo variant="dark" size="md" />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginBottom: '28px', letterSpacing: '0.04em' }}>
          Reset Your Password
        </p>

        {error && (
          <div className="animate-fade-in" style={{ marginBottom: '16px', padding: '10px 14px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--status-danger)', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
          </div>
        )}
        
        {success && (
          <div className="animate-fade-in" style={{ marginBottom: '16px', padding: '10px 14px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
            <CheckCircle size={16} style={{ flexShrink: 0 }} /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input type="password" placeholder="New Password" className="mark-input"
              style={{ width: '100%', paddingLeft: '38px', textAlign: 'left' }}
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input type="password" placeholder="Confirm Password" className="mark-input"
              style={{ width: '100%', paddingLeft: '38px', textAlign: 'left' }}
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
          </div>
          
          <button type="submit" className="action-button" style={{ justifyContent: 'center', marginTop: '4px', opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? 'Processing...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordScreen;
