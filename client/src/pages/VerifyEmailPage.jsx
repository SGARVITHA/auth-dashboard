import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api';

const s = {
  page: {
    minHeight: '100vh', background: '#F7F7F5', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Inter', -apple-system, sans-serif", padding: '24px',
  },
  card: {
    background: '#FFFFFF', border: '1px solid #E5E5E3', borderRadius: '12px',
    padding: '40px', width: '100%', maxWidth: '400px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
    textAlign: 'center',
  },
  icon: {
    width: '52px', height: '52px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '24px', margin: '0 auto 20px',
  },
  iconSuccess: { background: '#EEFAF4' },
  iconError: { background: '#FFF0EE' },
  iconLoading: { background: '#F0F0EE' },
  heading: { fontSize: '20px', fontWeight: '600', color: '#1A1A1A', letterSpacing: '-0.3px', marginBottom: '8px' },
  text: { fontSize: '14px', color: '#8C8C8A', lineHeight: '1.6', marginBottom: '24px' },
  link: {
    display: 'inline-block', fontSize: '14px', fontWeight: '500',
    color: '#FFFFFF', background: '#1A1A1A', textDecoration: 'none',
    padding: '10px 20px', borderRadius: '8px',
  },
  spinner: {
    width: '24px', height: '24px', border: '3px solid #E5E5E3',
    borderTopColor: '#1A1A1A', borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
};

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  
  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('This verification link is missing a token.');
      return;
    }
  
    let cancelled = false;
  
    const verify = async () => {
      console.log('VERIFY CALLED with token:', token); // ADD THIS
      try {
        await api.get(`/auth/verify-email?token=${token}`);
        if (!cancelled) setStatus('success');
      } catch (err) {
        if (!cancelled) {
          setStatus('error');
          setMessage(err.response?.data?.message || 'Verification failed.');
        }
      }
    };
    
    verify();
  
    return () => { cancelled = true; };
  }, [token]);

  return (
    <div style={s.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={s.card}>

        {status === 'loading' && (
          <>
            <div style={{ ...s.icon, ...s.iconLoading }}>
              <div style={s.spinner} />
            </div>
            <div style={s.heading}>Verifying your email...</div>
            <div style={s.text}>This will only take a moment.</div>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ ...s.icon, ...s.iconSuccess }}>✅</div>
            <div style={s.heading}>Email verified</div>
            <div style={s.text}>Your account is now fully activated. You can access your dashboard.</div>
            <Link to="/login" style={s.link}>Continue to sign in</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ ...s.icon, ...s.iconError }}>⚠️</div>
            <div style={s.heading}>Verification failed</div>
            <div style={s.text}>{message}</div>
            <Link to="/login" style={s.link}>Back to sign in</Link>
          </>
        )}

      </div>
    </div>
  );
}