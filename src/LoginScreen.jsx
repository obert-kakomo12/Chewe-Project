import React, { useState } from 'react';
import { KeyRound, Lock, User as UserIcon, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import CTLogo from './CTLogo';

const LoginScreen = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (isForgotPassword) {
      try {
        const response = await fetch(`http://13.140.177.98:3000/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to send reset email');
        setSuccess('If the email exists, a reset link has been sent!');
        setTimeout(() => setIsForgotPassword(false), 3000);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const payload = isLogin 
      ? { email, password }
      : { email, password, name, accessCode };

    try {
      const response = await fetch(`http://13.140.177.98:3000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      if (isLogin) {
        setSuccess('Login successful!');
        if (data.access_token) {
          localStorage.setItem('access_token', data.access_token);
        }
        setTimeout(() => {
          onLogin(data.user);
        }, 800);
      } else {
        setSuccess('Registration successful! Please log in.');
        setTimeout(() => {
          setIsLogin(true);
          setPassword('');
          setAccessCode('');
          setSuccess('');
        }, 2000);
      }
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
      {/* Decorative blobs */}
      <div style={{ position: 'fixed', top: '-15%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,114,232,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-20%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,114,232,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="glass-panel animate-fade-in" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 1, background: 'rgba(13,31,69,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <CTLogo variant="dark" size="md" />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginBottom: '28px', letterSpacing: '0.04em' }}>
          Secure Authentication System
        </p>

        {/* Tabs for Login / Register */}
        {!isForgotPassword && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
            <button 
              onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }} 
              style={{ 
                flex: 1, padding: '8px', background: 'none', 
                borderBottom: isLogin ? '2px solid var(--accent-blue)' : '2px solid transparent', 
                color: isLogin ? 'white' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.3s' 
              }}>
              Log In
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }} 
              style={{ 
                flex: 1, padding: '8px', background: 'none', 
                borderBottom: !isLogin ? '2px solid var(--accent-blue)' : '2px solid transparent', 
                color: !isLogin ? 'white' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.3s' 
              }}>
              Sign Up
            </button>
          </div>
        )}

        {isForgotPassword && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'white', marginBottom: '8px' }}>Forgot Password?</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Enter your email and we'll send you a reset link.</p>
          </div>
        )}

        {/* Alerts */}
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
          {!isLogin && !isForgotPassword && (
            <div className="animate-fade-in" style={{ position: 'relative' }}>
              <UserIcon size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input type="text" placeholder="Full Name" className="mark-input"
                style={{ width: '100%', paddingLeft: '38px', textAlign: 'left' }}
                value={name} onChange={e => setName(e.target.value)} required={!isLogin} />
            </div>
          )}
          
          {!isLogin && !isForgotPassword && (
            <div className="animate-fade-in" style={{ position: 'relative' }}>
              <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input type="text" placeholder="School Access Code" className="mark-input"
                style={{ width: '100%', paddingLeft: '38px', textAlign: 'left' }}
                value={accessCode} onChange={e => setAccessCode(e.target.value)} required={!isLogin} />
            </div>
          )}
          
          <div style={{ position: 'relative' }}>
            <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input type="email" placeholder="Email Address" className="mark-input"
              style={{ width: '100%', paddingLeft: '38px', textAlign: 'left' }}
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          
          {!isForgotPassword && (
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input type="password" placeholder="Password" className="mark-input"
                style={{ width: '100%', paddingLeft: '38px', textAlign: 'left' }}
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
          )}
          
          <button type="submit" className="action-button" style={{ justifyContent: 'center', marginTop: '4px', opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? 'Processing...' : (isForgotPassword ? 'Send Reset Link' : (isLogin ? 'Authenticate' : 'Create Account'))}
          </button>

          {isLogin && !isForgotPassword && (
            <button type="button" onClick={() => { setIsForgotPassword(true); setError(''); setSuccess(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '0.8rem', marginTop: '8px' }}>
              Forgot Password?
            </button>
          )}

          {isForgotPassword && (
            <button type="button" onClick={() => { setIsForgotPassword(false); setError(''); setSuccess(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', marginTop: '8px' }}>
              Back to Login
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
