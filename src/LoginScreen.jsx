import React, { useState } from 'react';
import { ShieldCheck, KeyRound, Lock, Smartphone } from 'lucide-react';

const LoginScreen = ({ onLogin }) => {
  const [step, setStep] = useState(1); // 1 = Password, 2 = MFA
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (username && password) {
      setStep(2);
    }
  };

  const handleMfaSubmit = (e) => {
    e.preventDefault();
    if (mfaCode.length === 6) {
      onLogin();
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-primary)', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel animate-fade-in" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={32} color="#fff" />
          </div>
        </div>
        
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '8px' }}>CT Tech's Pulse</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '32px' }}>
          End-to-End Encrypted Access
        </p>

        {step === 1 ? (
          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Staff ID" 
                className="mark-input"
                style={{ width: '100%', paddingLeft: '40px', textAlign: 'left' }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-secondary)' }} />
              <input 
                type="password" 
                placeholder="Password" 
                className="mark-input"
                style={{ width: '100%', paddingLeft: '40px', textAlign: 'left' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="action-button" style={{ justifyContent: 'center', marginTop: '8px' }}>
              Verify Identity
            </button>
            <div style={{ fontSize: '0.75rem', color: 'var(--status-success)', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <ShieldCheck size={14} /> AES-256 Secured Connection
            </div>
          </form>
        ) : (
          <form onSubmit={handleMfaSubmit} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <Smartphone size={32} color="var(--accent-blue)" />
            </div>
            <h3 style={{ fontSize: '1.125rem' }}>Multi-Factor Authentication</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Enter the 6-digit code sent to your registered device to access The Vault.
            </p>
            <input 
              type="text" 
              placeholder="000000" 
              maxLength="6"
              className="mark-input"
              style={{ width: '100%', textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px', padding: '12px' }}
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
              required
            />
            <button type="submit" className="action-button" style={{ justifyContent: 'center', marginTop: '8px' }}>
              Authenticate
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;
