import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '28px',
  },
  brandIcon: {
    width: '30px',
    height: '30px',
    background: '#1A1A1A',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
  },
  brandName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1A1A1A',
    letterSpacing: '-0.2px',
  },
  heading: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#1A1A1A',
    letterSpacing: '-0.3px',
    marginBottom: '6px',
  },
  subheading: {
    fontSize: '14px',
    color: '#8C8C8A',
    marginBottom: '28px',
    lineHeight: '1.5',
  },
  formGroup: { marginBottom: '16px' },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#3D3D3B',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    fontSize: '14px',
    border: '1px solid #E5E5E3',
    borderRadius: '7px',
    outline: 'none',
    color: '#1A1A1A',
    background: '#FAFAF9',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxSizing: 'border-box',
  },
  inputFocus: {
    borderColor: '#1A1A1A',
    background: '#FFFFFF',
    boxShadow: '0 0 0 3px rgba(26,26,26,0.06)',
  },
  inputError: {
    borderColor: '#E5534B',
    boxShadow: '0 0 0 3px rgba(229,83,75,0.08)',
  },
  fieldError: {
    fontSize: '12px',
    color: '#C9372C',
    marginTop: '5px',
  },
  errorBox: {
    fontSize: '13px',
    color: '#C9372C',
    background: '#FFF0EE',
    border: '1px solid #FFDBD8',
    borderRadius: '7px',
    padding: '10px 12px',
    marginBottom: '16px',
  },
  button: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    fontWeight: '500',
    background: '#1A1A1A',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '7px',
    cursor: 'pointer',
    marginTop: '4px',
  },
  buttonDisabled: {
    background: '#A0A09E',
    cursor: 'not-allowed',
  },
  divider: {
    borderTop: '1px solid #E5E5E3',
    margin: '24px 0',
  },
  footer: {
    fontSize: '13px',
    color: '#8C8C8A',
    textAlign: 'center',
  },
  link: {
    color: '#1A1A1A',
    fontWeight: '500',
    textDecoration: 'none',
  },
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!EMAIL_REGEX.test(email)) e.email = 'Enter a valid email address.';
    if (!password) e.password = 'Password is required.';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setServerError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    ...s.input,
    ...(focused === field ? s.inputFocus : {}),
    ...(errors[field] ? s.inputError : {}),
  });

  return (
    <div style={s.page}>
      <div style={s.card}>

        <div style={s.brand}>
          <div style={s.brandIcon}>🔑</div>
          <span style={s.brandName}>AuthKit</span>
        </div>

        <div style={s.heading}>Welcome back</div>
        <div style={s.subheading}>Sign in to your account to continue.</div>

        {serverError && <div style={s.errorBox}>{serverError}</div>}

        <div style={s.formGroup}>
          <label style={s.label}>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused('')}
            style={inputStyle('email')}
          />
          {errors.email && <div style={s.fieldError}>{errors.email}</div>}
        </div>

        <div style={s.formGroup}>
          <label style={s.label}>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
            onFocus={() => setFocused('password')}
            onBlur={() => setFocused('')}
            style={inputStyle('password')}
          />
          {errors.password && <div style={s.fieldError}>{errors.password}</div>}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ ...s.button, ...(loading ? s.buttonDisabled : {}) }}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <div style={s.divider} />
        <div style={s.footer}>
          No account?{' '}
          <Link to="/register" style={s.link}>Create one</Link>
        </div>

      </div>
    </div>
  );
}