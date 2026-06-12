import React, { useState } from 'react';
import { KeyRound, Lock, Smartphone, AlertCircle } from 'lucide-react';
import CTLogo from './CTLogo';

const LoginScreen = ({ onLogin }) => {
  const [step,     setStep]     = useState(1);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode,  setMfaCode]  = useState('');
  const [attempts, setAttempts] = useState(0);
  const [locked,   setLocked]   = useState(false);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (username && password) setStep(2);
  };

  const handleMfaSubmit = (e) => {
    e.preventDefault();
    if (locked) return;
    if (mfaCode.length === 6) {
      // Simulate brute-force protection: wrong code increments attempts
      if (mfaCode !== '000000') {
        const next = attempts + 1;
        setAttempts(next);
        if (next >= 3) setLocked(true);
        return;
      }
      onLogin();
    }
  };

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: 'linear-gradient(135deg, #050d1a 0%, #0a1628 50%, #0d1f45 100%)',
      alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      {/* Decorative blobs */}
      <div style={{ position: 'fixed', top: '-15%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,114,232,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-20%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,114,232,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="glass-panel animate-fade-in" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 1, background: 'rgba(13,31,69,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <CTLogo variant="dark" size="md" />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginBottom: '28px', letterSpacing: '0.04em' }}>
          Secure Staff Portal
        </p>

        {/* Step indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
          {[1, 2].map(s => (
            <div key={s} style={{ width: '28px', height: '4px', borderRadius: '2px', background: step >= s ? 'var(--accent-blue)' : 'var(--border-color)', transition: 'background 0.3s' }} />
          ))}
        </div>

        {step === 1 ? (
          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input type="text" placeholder="Staff ID" className="mark-input"
                style={{ width: '100%', paddingLeft: '38px', textAlign: 'left' }}
                value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div style={{ position: 'relative' }}>
              <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input type="password" placeholder="Password" className="mark-input"
                style={{ width: '100%', paddingLeft: '38px', textAlign: 'left' }}
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="action-button" style={{ justifyContent: 'center', marginTop: '4px' }}>
              Verify Identity
            </button>
          </form>
        ) : (
          <form onSubmit={handleMfaSubmit} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-blue-light)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Smartphone size={24} color="var(--accent-blue)" />
              </div>
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Multi-Factor Authentication</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              Enter the 6-digit code sent to your registered mobile device.
            </p>

            {locked && (
              <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--status-danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={14} /> Account locked after 3 failed attempts. Contact your administrator.
              </div>
            )}

            {!locked && attempts > 0 && (
              <div style={{ padding: '8px 12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '6px', fontSize: '0.78rem', color: 'var(--status-warning)' }}>
                ⚠ {3 - attempts} attempt{3 - attempts !== 1 ? 's' : ''} remaining. Use code: 000000 (demo)
              </div>
            )}

            <input type="text" placeholder="000000" maxLength="6" className="mark-input"
              style={{ width: '100%', textAlign: 'center', fontSize: '1.5rem', letterSpacing: '10px', padding: '12px' }}
              value={mfaCode} onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))}
              disabled={locked} required />

            <button type="submit" className="action-button" style={{ justifyContent: 'center', opacity: locked ? 0.5 : 1 }} disabled={locked}>
              Authenticate
            </button>
            <button type="button" onClick={() => { setStep(1); setAttempts(0); setLocked(false); setMfaCode(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem' }}>
              ← Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;
