import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const s = {
  page: {
    minHeight: '100vh',
    background: '#F7F7F5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', -apple-system, sans-serif",
    padding: '24px',
  },
  card: {
    background: '#FFFFFF',
    border: '1px solid #E5E5E3',
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
  },
  brand: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' },
  brandIcon: {
    width: '30px', height: '30px', background: '#1A1A1A', borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px',
  },
  brandName: { fontSize: '15px', fontWeight: '600', color: '#1A1A1A', letterSpacing: '-0.2px' },
  heading: { fontSize: '22px', fontWeight: '600', color: '#1A1A1A', letterSpacing: '-0.3px', marginBottom: '6px' },
  subheading: { fontSize: '14px', color: '#8C8C8A', marginBottom: '28px', lineHeight: '1.5' },
  formGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '500', color: '#3D3D3B', marginBottom: '6px' },
  input: {
    width: '100%', padding: '10px 13px', fontSize: '14px',
    border: '1px solid #E5E5E3', borderRadius: '8px', outline: 'none',
    color: '#1A1A1A', background: '#FAFAF9',
    transition: 'border-color 0.15s, box-shadow 0.15s', boxSizing: 'border-box',
  },
  inputFocus: { borderColor: '#1A1A1A', background: '#FFFFFF', boxShadow: '0 0 0 3px rgba(26,26,26,0.06)' },
  inputErr: { borderColor: '#E5534B', boxShadow: '0 0 0 3px rgba(229,83,75,0.08)' },
  fieldErr: { fontSize: '12px', color: '#C9372C', marginTop: '5px' },
  button: {
    width: '100%', padding: '11px', fontSize: '14px', fontWeight: '500',
    background: '#1A1A1A', color: '#FFFFFF', border: 'none', borderRadius: '8px',
    cursor: 'pointer', marginTop: '4px',
  },
  buttonDisabled: { background: '#A0A09E', cursor: 'not-allowed' },
  divider: { borderTop: '1px solid #E5E5E3', margin: '24px 0' },
  footer: { fontSize: '13px', color: '#8C8C8A', textAlign: 'center' },
  link: { color: '#1A1A1A', fontWeight: '500', textDecoration: 'none' },

  // success state
  successIcon: {
    width: '48px', height: '48px', background: '#EEFAF4', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '22px', margin: '0 auto 20px',
  },
  successText: { fontSize: '14px', color: '#3D3D3B', textAlign: 'center', lineHeight: '1.6', marginBottom: '24px' },
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!EMAIL_REGEX.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      // Same response either way — never leak whether email exists
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.successIcon}>📩</div>
          <div style={{ ...s.heading, textAlign: 'center' }}>Check your inbox</div>
          <div style={s.successText}>
            If <strong>{email}</strong> is registered, we've sent a password reset link.
            It expires in 1 hour.
          </div>
          <div style={s.divider} />
          <div style={s.footer}>
            <Link to="/login" style={s.link}>Back to sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.brand}>
          <div style={s.brandIcon}>🔑</div>
          <span style={s.brandName}>AuthKit</span>
        </div>

        <div style={s.heading}>Forgot your password?</div>
        <div style={s.subheading}>Enter your email and we'll send you a reset link.</div>

        <div style={s.formGroup}>
          <label style={s.label}>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              ...s.input,
              ...(focused ? s.inputFocus : {}),
              ...(error ? s.inputErr : {}),
            }}
          />
          {error && <div style={s.fieldErr}>{error}</div>}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ ...s.button, ...(loading ? s.buttonDisabled : {}) }}
        >
          {loading ? 'Sending...' : 'Send reset link'}
        </button>

        <div style={s.divider} />
        <div style={s.footer}>
          <Link to="/login" style={s.link}>Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}