import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const NAME_REGEX = /^[a-zA-Z\s]{2,40}$/;

const pwChecks = [
  { label: '8+ characters',           test: (p) => p.length >= 8 },
  { label: 'Uppercase letter',         test: (p) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter',         test: (p) => /[a-z]/.test(p) },
  { label: 'Number',                   test: (p) => /\d/.test(p) },
  { label: 'Special char (@$!%*?&)',   test: (p) => /[@$!%*?&]/.test(p) },
];

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
    padding: '48px 52px',
    width: '100%',
    maxWidth: '450px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
    boxSizing: 'border-box',
  },
  inner: {
    maxWidth: '420px',
    margin: '0 auto',
  },
  brand: {
    display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px',
  },
  brandIcon: {
    width: '30px', height: '30px', background: '#1A1A1A', borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px',
  },
  brandName: { fontSize: '15px', fontWeight: '600', color: '#1A1A1A', letterSpacing: '-0.2px' },
  heading: { fontSize: '22px', fontWeight: '600', color: '#1A1A1A', letterSpacing: '-0.3px', marginBottom: '6px', textAlign: 'center' },
  subheading: { fontSize: '14px', color: '#8C8C8A', marginBottom: '28px', lineHeight: '1.5', textAlign: 'center' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
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
    background: '#1A1A1A', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '4px',
  },
  buttonDisabled: { background: '#A0A09E', cursor: 'not-allowed' },
  divider: { borderTop: '1px solid #E5E5E3', margin: '24px 0' },
  footer: { fontSize: '13px', color: '#8C8C8A', textAlign: 'center' },
  link: { color: '#1A1A1A', fontWeight: '500', textDecoration: 'none' },
};

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const navigate = useNavigate();

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!NAME_REGEX.test(form.name)) e.name = 'Name: 2–40 letters only.';
    if (!EMAIL_REGEX.test(form.email)) e.email = 'Enter a valid email.';
    if (!PASSWORD_REGEX.test(form.password)) e.password = 'Password doesn\'t meet all requirements.';
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
      const { data } = await api.post('/auth/register', {
        name: form.name.trim(), email: form.email, password: form.password,
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', form.name.trim());
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
    ...(errors[field] ? s.inputErr : {}),
  });

  return (
    <div style={s.page}>
      <div style={s.card}>
        
          <div style={s.brand}>
            <div style={s.brandIcon}>🔑</div>
            <span style={s.brandName}>AuthKit</span>
          </div>

          <div style={s.heading}>Create an account</div>
          <div style={s.subheading}>Get started — it only takes a few seconds.</div>

          {serverError && <div style={s.errBox}>{serverError}</div>}

          
            <div style={s.formGroup}>
              <label style={s.label}>Full name</label>
              <input
                type="text" placeholder="Full Name" value={form.name}
                onChange={set('name')} onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
                style={inputStyle('name')}
              />
              {errors.name && <div style={s.fieldErr}>{errors.name}</div>}
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Email</label>
              <input
                type="email" placeholder="you@example.com" value={form.email}
                onChange={set('email')} onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                style={inputStyle('email')}
              />
              {errors.email && <div style={s.fieldErr}>{errors.email}</div>}
            </div>
          

          <div style={s.formGroup}>
            <label style={s.label}>Password</label>
            <input
              type="password" placeholder="Create a strong password" value={form.password}
              onChange={set('password')} onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
              style={inputStyle('password')}
            />
            {errors.password && <div style={s.fieldErr}>{errors.password}</div>}
            {form.password.length > 0 && (
              <div style={s.pwRules}>
                {pwChecks.map((c) => {
                  const ok = c.test(form.password);
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

          <button
            onClick={handleSubmit} disabled={loading}
            style={{ ...s.button, ...(loading ? s.buttonDisabled : {}) }}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <div style={s.divider} />
          <div style={s.footer}>
            Already have an account? <Link to="/login" style={s.link}>Sign in</Link>
          </div>
        </div>
      </div>
    
  );
}