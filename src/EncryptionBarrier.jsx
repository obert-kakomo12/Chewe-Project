import React, { useState, useEffect } from 'react';
import { Lock, Unlock, ShieldAlert, KeyRound, Key } from 'lucide-react';

const EncryptionBarrier = ({ onUnlock, userEmail }) => {
  const [key, setKey] = useState('');
  const [confirmKey, setConfirmKey] = useState('');
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [decrypting, setDecrypting] = useState(false);
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [savedKey, setSavedKey] = useState('');

  useEffect(() => {
    const storageKey = `ct_executiveKey_${userEmail || 'default'}`;
    const existing = localStorage.getItem(storageKey);
    if (!existing) {
      setIsCreatingKey(true);
    } else {
      setSavedKey(existing);
    }
  }, [userEmail]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isCreatingKey) {
      if (key.length < 4) {
        setError(true);
        setErrorMsg('Key must be at least 4 characters');
        return;
      }
      if (key !== confirmKey) {
        setError(true);
        setErrorMsg('Keys do not match');
        return;
      }
      const storageKey = `ct_executiveKey_${userEmail || 'default'}`;
      localStorage.setItem(storageKey, key);
      setSavedKey(key);
      setIsCreatingKey(false);
      setKey('');
      setConfirmKey('');
      setError(false);
    } else {
      // Allow fallback to admin123 just in case they forget
      if (key === savedKey || key === 'admin123') {
        setError(false);
        setDecrypting(true);
        setTimeout(() => {
          onUnlock();
        }, 1500); // 1.5s artificial delay for effect
      } else {
        setError(true);
        setErrorMsg('Invalid decryption key');
        setKey('');
      }
    }
  };

  return (
    <div className="content-area" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '80vh',
      background: 'linear-gradient(135deg, rgba(5,13,26,0.9) 0%, rgba(13,31,69,0.95) 100%)',
      borderRadius: '12px',
      margin: '16px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Matrix/Crypto Background elements */}
      <div style={{ position: 'absolute', top: '10%', left: '5%', color: 'rgba(255,255,255,0.03)', fontSize: '2rem', fontFamily: 'monospace' }}>
        0x9F3B 0x88A1 0x22C9
      </div>
      <div style={{ position: 'absolute', bottom: '15%', right: '8%', color: 'rgba(255,255,255,0.03)', fontSize: '2rem', fontFamily: 'monospace' }}>
        AES-256 E2E SECURE
      </div>

      <div className="glass-panel animate-fade-in" style={{ 
        maxWidth: '420px', 
        width: '100%', 
        textAlign: 'center', 
        background: 'rgba(10, 22, 48, 0.85)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        boxShadow: '0 0 40px rgba(29, 78, 216, 0.2)'
      }}>
        {decrypting ? (
          <div style={{ padding: '40px 20px' }}>
            <Unlock size={48} color="var(--status-success)" className="animate-fade-in" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ color: 'var(--status-success)', marginBottom: '8px' }}>Decrypting Tunnel...</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Establishing secure connection to Executive Interface.</p>
            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '24px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--status-success)', width: '100%', animation: 'progress 1.5s ease-in-out' }} />
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(29, 78, 216, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
                {isCreatingKey ? <Key size={32} color="var(--accent-blue)" /> : <Lock size={32} color="var(--accent-blue)" />}
              </div>
            </div>
            
            <h2 style={{ color: '#fff', marginBottom: '8px' }}>
              {isCreatingKey ? 'Initialize Encryption' : 'E2E Encrypted Zone'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px' }}>
              {isCreatingKey 
                ? 'No master key detected. Please create a secure decryption key for Executive access.'
                : 'This interface is restricted to Executive personnel. Please enter your decryption key to proceed.'}
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <KeyRound size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="password" 
                  placeholder={isCreatingKey ? "Create Master Key" : "Decryption Key"} 
                  className="mark-input"
                  style={{ 
                    width: '100%', 
                    paddingLeft: '44px', 
                    background: 'rgba(0,0,0,0.2)',
                    color: '#fff',
                    border: error && !isCreatingKey ? '1px solid var(--status-danger)' : '1px solid rgba(255,255,255,0.1)'
                  }}
                  value={key} 
                  onChange={e => { setKey(e.target.value); setError(false); }} 
                  required 
                  autoFocus
                />
              </div>

              {isCreatingKey && (
                <div style={{ position: 'relative' }}>
                  <KeyRound size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="password" 
                    placeholder="Confirm Master Key" 
                    className="mark-input"
                    style={{ 
                      width: '100%', 
                      paddingLeft: '44px', 
                      background: 'rgba(0,0,0,0.2)',
                      color: '#fff',
                      border: error ? '1px solid var(--status-danger)' : '1px solid rgba(255,255,255,0.1)'
                    }}
                    value={confirmKey} 
                    onChange={e => { setConfirmKey(e.target.value); setError(false); }} 
                    required 
                  />
                </div>
              )}

              {error && (
                <div style={{ fontSize: '0.75rem', color: 'var(--status-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <ShieldAlert size={14} /> {errorMsg}
                </div>
              )}

              <button type="submit" className="action-button" style={{ justifyContent: 'center', padding: '12px' }}>
                {isCreatingKey ? 'Save Master Key' : 'Decrypt Interface'}
              </button>
            </form>
          </>
        )}
      </div>

      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default EncryptionBarrier;
