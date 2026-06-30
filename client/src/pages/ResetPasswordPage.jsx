import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const pwChecks = [
  { label: '8+ characters', test: (p) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'Number', test: (p) => /\d/.test(p) },
  { label: 'Special char (@$!%*?&)', test: (p) => /[@$!%*?&]/.test(p) },
];

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
  errBox: {
    fontSize: '13px', color: '#C9372C', background: '#FFF0EE',
    border: '1px solid #FFDBD8', borderRadius: '8px', padding: '10px 13px', marginBottom: '16px',
  },
  pwRules: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 12px', marginTop: '8px' },
  pwRule: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' },
  button: {
    width: '100%', padding: '11px', fontSize: '14px', fontWeight: '500',
    background: '#1A1A1A', color: '#FFFFFF', border: 'none', borderRadius: '8px',
    cursor: 'pointer', marginTop: '4px',
  },
  buttonDisabled: { background: '#A0A09E', cursor: 'not-allowed' },
  footer: { fontSize: '13px', color: '#8C8C8A', textAlign: 'center', marginTop: '20px' },
  link: { color: '#1A1A1A', fontWeight: '500', textDecoration: 'none' },

  successIcon: {
    width: '48px', height: '48px', background: '#EEFAF4', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '22px', margin: '0 auto 20px',
  },
  successText: { fontSize: '14px', color: '#3D3D3B', textAlign: 'center', lineHeight: '1.6' },
};

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState('');

  // No token in URL at all — dead link
  if (!token) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.brand}>
            <div style={s.brandIcon}>🔑</div>
            <span style={s.brandName}>AuthKit</span>
          </div>
          <div style={s.heading}>Invalid reset link</div>
          <div style={s.subheading}>This link is missing a token. Request a new one.</div>
          <Link to="/forgot-password" style={s.link}>Request new link →</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!PASSWORD_REGEX.test(password)) {
      setError("Password doesn't meet all requirements below.");
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.successIcon}>✅</div>
          <div style={{ ...s.heading, textAlign: 'center' }}>Password reset</div>
          <div style={s.successText}>Redirecting you to sign in...</div>
        </div>
      </div>
    );
  }

  const inputStyle = (field) => ({
    ...s.input,
    ...(focused === field ? s.inputFocus : {}),
    ...(error ? s.inputErr : {}),
  });

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.brand}>
          <div style={s.brandIcon}>🔑</div>
          <span style={s.brandName}>AuthKit</span>
        </div>

        <div style={s.heading}>Set a new password</div>
        <div style={s.subheading}>Choose a strong password for your account.</div>

        {error && <div style={s.errBox}>{error}</div>}

        <div style={s.formGroup}>
          <label style={s.label}>New password</label>
          <input
            type="password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            onFocus={() => setFocused('password')}
            onBlur={() => setFocused('')}
            style={inputStyle('password')}
          />
          {password.length > 0 && (
            <div style={s.pwRules}>
              {pwChecks.map((c) => {
                const ok = c.test(password);
                return (
                  <div key={c.label} style={s.pwRule}>
                    <span style={{ color: ok ? '#3EB87A' : '#C0C0BE', fontSize: '11px' }}>{ok ? '✓' : '○'}</span>
                    <span style={{ color: ok ? '#3D3D3B' : '#A0A09E' }}>{c.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={s.formGroup}>
          <label style={s.label}>Confirm new password</label>
          <input
            type="password"
            placeholder="Re-enter new password"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setError(''); }}
            onFocus={() => setFocused('confirm')}
            onBlur={() => setFocused('')}
            style={inputStyle('confirm')}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ ...s.button, ...(loading ? s.buttonDisabled : {}) }}
        >
          {loading ? 'Resetting...' : 'Reset password'}
        </button>

        <div style={s.footer}>
          <Link to="/login" style={s.link}>Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}