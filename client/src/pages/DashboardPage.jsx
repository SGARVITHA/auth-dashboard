import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

const getMemberDays = (d) => {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days === 0) return 'Joined today';
  return days === 1 ? '1 day' : `${days} days`;
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const activities = [
  { icon: '🔐', bg: '#EEF4FF', text: 'Signed in successfully', time: 'Just now' },
  { icon: '✅', bg: '#EEFAF4', text: 'JWT token issued — valid for 7 days', time: 'Just now' },
  { icon: '👤', bg: '#F5F0FF', text: 'Profile loaded from database', time: 'Just now' },
  { icon: '🛡️', bg: '#FFF7EE', text: 'Protected route accessed', time: 'Just now' },
];

const s = {
  page: { minHeight: '100vh', background: '#F7F7F5', fontFamily: "'Inter', -apple-system, sans-serif" },

  nav: {
    background: '#FFFFFF', borderBottom: '1px solid #E5E5E3',
    padding: '0 32px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', height: '52px',
    position: 'sticky', top: 0, zIndex: 10,
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: '8px' },
  navIcon: {
    width: '26px', height: '26px', background: '#1A1A1A', borderRadius: '6px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px',
  },
  navBrand: { fontSize: '14px', fontWeight: '600', color: '#1A1A1A', letterSpacing: '-0.2px' },
  navRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  navEmail: { fontSize: '13px', color: '#8C8C8A' },
  signOutBtn: {
    fontSize: '13px', fontWeight: '500', color: '#3D3D3B',
    background: 'transparent', border: '1px solid #E5E5E3',
    borderRadius: '6px', padding: '5px 12px', cursor: 'pointer',
  },

  main: { maxWidth: '1200px', margin: '0 auto', padding: '36px 40px' },

  pageHeader: { marginBottom: '28px' },
  greeting: { fontSize: '22px', fontWeight: '600', color: '#1A1A1A', letterSpacing: '-0.3px', marginBottom: '4px' },
  greetingSub: { fontSize: '14px', color: '#8C8C8A' },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' },
  statCard: { background: '#FFFFFF', border: '1px solid #E5E5E3', borderRadius: '10px', padding: '24px 28px' },
  statLabel: { fontSize: '11px', fontWeight: '500', color: '#A0A09E', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' },
  statValue: { fontSize: '22px', fontWeight: '600', color: '#1A1A1A', letterSpacing: '-0.4px', marginBottom: '3px' },
  statSub: { fontSize: '12px', color: '#A0A09E' },
  dot: { display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: '#3EB87A', marginRight: '6px', verticalAlign: 'middle' },

  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },

  card: { background: '#FFFFFF', border: '1px solid #E5E5E3', borderRadius: '10px', overflow: 'hidden' },
  cardHead: { padding: '13px 18px', borderBottom: '1px solid #F0F0EE', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: '13px', fontWeight: '600', color: '#1A1A1A' },
  cardBadge: { fontSize: '11px', fontWeight: '500', background: '#F0F0EE', color: '#6B6B69', padding: '2px 8px', borderRadius: '20px' },
  cardBody: { padding: '18px' },

  avatar: {
    width: '44px', height: '44px', background: '#1A1A1A', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '15px', fontWeight: '600', color: '#FFFFFF', marginBottom: '10px',
  },
  profileName: { fontSize: '14px', fontWeight: '600', color: '#1A1A1A', marginBottom: '2px' },
  profileEmail: { fontSize: '13px', color: '#8C8C8A', marginBottom: '14px' },
  profileRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid #F0F0EE' },
  profileKey: { fontSize: '12px', color: '#A0A09E', fontWeight: '500' },
  profileVal: { fontSize: '12px', color: '#3D3D3B', fontFamily: "'JetBrains Mono', monospace" },

  activityItem: { display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '9px 0', borderBottom: '1px solid #F0F0EE' },
  activityItemLast: { borderBottom: 'none' },
  activityIconWrap: { width: '28px', height: '28px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0, marginTop: '1px' },
  activityContent: { flex: 1, minWidth: 0 },
  activityText: { fontSize: '13px', color: '#3D3D3B', lineHeight: '1.4' },
  activityTime: { fontSize: '11px', color: '#A0A09E', marginTop: '2px' },

  bottomGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  bottomCard: {
    background: '#FFFFFF', border: '1px solid #E5E5E3', borderRadius: '10px',
    padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
  },
  bottomCardDanger: {
    background: '#FFFFFF', border: '1px solid #FFDBD8', borderRadius: '10px',
    padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
  },
  bottomLeft: { display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 },
  bottomIconWrap: { width: '34px', height: '34px', background: '#F0F0EE', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', flexShrink: 0 },
  bottomIconDanger: { width: '34px', height: '34px', background: '#FFF0EE', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', flexShrink: 0 },
  bottomTitle: { fontSize: '13px', fontWeight: '500', color: '#1A1A1A', marginBottom: '2px' },
  bottomSub: { fontSize: '12px', color: '#A0A09E' },
  manageBtn: { fontSize: '13px', fontWeight: '500', color: '#1A1A1A', background: '#F0F0EE', border: 'none', borderRadius: '6px', padding: '6px 13px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 },
  removeBtn: { fontSize: '13px', fontWeight: '500', color: '#C9372C', background: '#FFF0EE', border: '1px solid #FFDBD8', borderRadius: '6px', padding: '6px 13px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 },

  // MODAL
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' },
  modal: { background: '#FFFFFF', borderRadius: '12px', padding: '28px', width: '100%', maxWidth: '400px', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' },
  modalTitle: { fontSize: '16px', fontWeight: '600', color: '#1A1A1A', marginBottom: '6px', letterSpacing: '-0.2px' },
  modalSub: { fontSize: '13px', color: '#8C8C8A', lineHeight: '1.6', marginBottom: '18px' },
  modalLabel: { fontSize: '13px', fontWeight: '500', color: '#3D3D3B', marginBottom: '6px', display: 'block' },
  modalInput: { width: '100%', padding: '9px 12px', fontSize: '14px', border: '1px solid #E5E5E3', borderRadius: '7px', outline: 'none', boxSizing: 'border-box', marginBottom: '12px', color: '#1A1A1A', background: '#FAFAF9' },
  modalInputErr: { borderColor: '#E5534B' },
  modalErr: { fontSize: '13px', color: '#C9372C', background: '#FFF0EE', border: '1px solid #FFDBD8', borderRadius: '7px', padding: '9px 12px', marginBottom: '14px' },
  modalHint: { fontSize: '12px', color: '#A0A09E', marginBottom: '18px', lineHeight: '1.5' },
  modalDivider: { borderTop: '1px solid #F0F0EE', margin: '16px 0' },
  modalActions: { display: 'flex', gap: '8px', justifyContent: 'flex-end' },
  cancelBtn: { fontSize: '13px', fontWeight: '500', color: '#3D3D3B', background: '#F0F0EE', border: 'none', borderRadius: '6px', padding: '7px 14px', cursor: 'pointer' },
  confirmBtn: { fontSize: '13px', fontWeight: '500', color: '#FFFFFF', background: '#1A1A1A', border: 'none', borderRadius: '6px', padding: '7px 14px', cursor: 'pointer' },
  confirmBtnDisabled: { fontSize: '13px', fontWeight: '500', color: '#FFFFFF', background: '#A0A09E', border: 'none', borderRadius: '6px', padding: '7px 14px', cursor: 'not-allowed' },
  confirmBtnDanger: { fontSize: '13px', fontWeight: '500', color: '#FFFFFF', background: '#C9372C', border: 'none', borderRadius: '6px', padding: '7px 14px', cursor: 'pointer' },
  confirmBtnDangerDisabled: { fontSize: '13px', fontWeight: '500', color: '#FFFFFF', background: '#E8A09C', border: 'none', borderRadius: '6px', padding: '7px 14px', cursor: 'not-allowed' },

  loading: { minHeight: '100vh', background: '#F7F7F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", fontSize: '14px', color: '#A0A09E' },

  
};
const bannerStyles = {
  banner: {
    background: '#FFF7EE',
    border: '1px solid #FAE0BD',
    borderRadius: '10px',
    padding: '14px 18px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  bannerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  bannerText: {
    fontSize: '13px',
    color: '#7A4A0F',
  },
  bannerBtn: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#7A4A0F',
    background: '#FAE0BD',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 13px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
};

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'manage' | 'remove'
  const [modalLoading, setModalLoading] = useState(false);
  const [modalErr, setModalErr] = useState('');
  const [resendStatus, setResendStatus] = useState(''); // '', 'sending', 'sent'

  // manage password fields
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  // remove account field
  const [removePw, setRemovePw] = useState('');

  const navigate = useNavigate();
  const storedName = localStorage.getItem('userName') || '';

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch {
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
  
    fetchUser();
    window.addEventListener('focus', fetchUser); // refetch when user comes back to tab
    return () => window.removeEventListener('focus', fetchUser);
  }, []);
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  const openModal = (type) => {
    setModal(type);
    setModalErr('');
    setCurrentPw(''); setNewPw(''); setConfirmPw(''); setRemovePw('');
  };
// ── EMAIL VERIFICATION ──────────────────────────────────
  const handleResendVerification = async () => {
    setResendStatus('sending');
    try {
      await api.post('/auth/resend-verification');
      setResendStatus('sent');
    } catch {
      setResendStatus('');
    }
  };

  // ── CHANGE PASSWORD ──────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPw) { setModalErr('Enter your current password.'); return; }
    if (!PASSWORD_REGEX.test(newPw)) { setModalErr('New password must be 8+ chars with uppercase, lowercase, number, and special character (@$!%*?&).'); return; }
    if (newPw !== confirmPw) { setModalErr('New passwords do not match.'); return; }
    setModalLoading(true);
    try {
      await api.put('/auth/password', { currentPassword: currentPw, newPassword: newPw });
      setModal(null);
    } catch (err) {
      setModalErr(err.response?.data?.message || 'Failed to update password. Check your current password.');
    } finally {
      setModalLoading(false);
    }
  };

  // ── REMOVE ACCOUNT ───────────────────────────────────
  const handleRemoveAccount = async (e) => {
    e.preventDefault();
    if (!removePw) { setModalErr('Enter your password to confirm.'); return; }
    setModalLoading(true);
    try {
      await api.delete('/auth/account', { data: { password: removePw } });
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      navigate('/login');
    } catch (err) {
      setModalErr(err.response?.data?.message || 'Incorrect password. Account not deleted.');
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) return <div style={s.loading}>Loading...</div>;

  const displayName = user.name || storedName || user.email.split('@')[0];
  const initials = getInitials(displayName);

  return (
    <div style={s.page}>

      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.navLeft}>
          <div style={s.navIcon}>🔑</div>
          <span style={s.navBrand}>AuthKit</span>
        </div>
        <div style={s.navRight}>
          <span style={s.navEmail}>{user.email}</span>
          <button style={s.signOutBtn} onClick={handleLogout}>Sign out</button>
        </div>
      </nav>

      <main style={s.main}>

        <div style={s.pageHeader}>
          <div style={s.greeting}>{getGreeting()}, {displayName} 👋</div>
          <div style={s.greetingSub}>Here's what's going on with your account.</div>
        </div>
        {!user.is_verified && (
  <div style={bannerStyles.banner}>
    <div style={bannerStyles.bannerLeft}>
      <span>📧</span>
      <span style={bannerStyles.bannerText}>
        Your email isn't verified yet. Check your inbox for the verification link.
      </span>
    </div>
    <button
      style={bannerStyles.bannerBtn}
      onClick={handleResendVerification}
      disabled={resendStatus === 'sending' || resendStatus === 'sent'}
    >
      {resendStatus === 'sent' ? 'Sent!' : resendStatus === 'sending' ? 'Sending...' : 'Resend email'}
       </button>
       </div>
        )}
        {/* STATS */}
        <div style={s.statsGrid}>
          <div style={s.statCard}>
            <div style={s.statLabel}>Status</div>
            <div style={s.statValue}><span style={s.dot} />Active</div>
            <div style={s.statSub}>Account in good standing</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}>Member for</div>
            <div style={s.statValue}>{getMemberDays(user.created_at)}</div>
            <div style={s.statSub}>Since {formatDate(user.created_at)}</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}>User ID</div>
            <div style={{ ...s.statValue, fontSize: '18px', fontFamily: "'JetBrains Mono', monospace" }}>
              #{String(user.id).padStart(4, '0')}
            </div>
            <div style={s.statSub}>Unique identifier</div>
          </div>
        </div>

        {/* PROFILE + ACTIVITY */}
        <div style={s.twoCol}>
          <div style={s.card}>
            <div style={s.cardHead}>
              <span style={s.cardTitle}>Profile</span>
              <span style={s.cardBadge}>Personal</span>
            </div>
            <div style={s.cardBody}>
              <div style={s.avatar}>{initials}</div>
              <div style={s.profileName}>{displayName}</div>
              <div style={s.profileEmail}>{user.email}</div>
              {[
                { k: 'Email',   v: user.email },
                { k: 'Joined',  v: formatDate(user.created_at) },
                { k: 'User ID', v: `#${String(user.id).padStart(4, '0')}` },
                { k: 'Auth',    v: 'JWT · 7d expiry' },
              ].map((row) => (
                <div key={row.k} style={s.profileRow}>
                  <span style={s.profileKey}>{row.k}</span>
                  <span style={s.profileVal}>{row.v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={s.card}>
            <div style={s.cardHead}>
              <span style={s.cardTitle}>Recent activity</span>
              <span style={s.cardBadge}>This session</span>
            </div>
            <div style={s.cardBody}>
              {activities.map((a, i) => (
                <div key={i} style={{ ...s.activityItem, ...(i === activities.length - 1 ? s.activityItemLast : {}) }}>
                  <div style={{ ...s.activityIconWrap, background: a.bg }}>{a.icon}</div>
                  <div style={s.activityContent}>
                    <div style={s.activityText}>{a.text}</div>
                    <div style={s.activityTime}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECURITY + REMOVE */}
        <div style={s.bottomGrid}>
          <div style={s.bottomCard}>
            <div style={s.bottomLeft}>
              <div style={s.bottomIconWrap}>🔑</div>
              <div>
                <div style={s.bottomTitle}>Password &amp; security</div>
                <div style={s.bottomSub}>Hashed with bcrypt · 12 rounds</div>
              </div>
            </div>
            <button style={s.manageBtn} onClick={() => openModal('manage')}>Manage</button>
          </div>

          <div style={s.bottomCardDanger}>
            <div style={s.bottomLeft}>
              <div style={s.bottomIconDanger}>🗑️</div>
              <div>
                <div style={s.bottomTitle}>Remove account</div>
                <div style={s.bottomSub}>Permanently delete your data</div>
              </div>
            </div>
            <button style={s.removeBtn} onClick={() => openModal('remove')}>Remove</button>
          </div>
        </div>

      </main>

      {/* ── MANAGE PASSWORD MODAL ── */}
      {modal === 'manage' && (
        <div style={s.overlay} onClick={() => setModal(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalTitle}>Change password</div>
            <div style={s.modalSub}>Enter your current password first, then set a new one.</div>

            {modalErr && <div style={s.modalErr}>{modalErr}</div>}

            <label style={s.modalLabel}>Current password</label>
            <input
              type="password" placeholder="Your current password"
              value={currentPw}
              onChange={(e) => { setCurrentPw(e.target.value); setModalErr(''); }}
              style={s.modalInput}
            />

            <div style={s.modalDivider} />

            <label style={s.modalLabel}>New password</label>
            <input
              type="password" placeholder="8+ chars, upper, lower, number, special"
              value={newPw}
              onChange={(e) => { setNewPw(e.target.value); setModalErr(''); }}
              style={s.modalInput}
            />

            <label style={s.modalLabel}>Confirm new password</label>
            <input
              type="password" placeholder="Re-enter new password"
              value={confirmPw}
              onChange={(e) => { setConfirmPw(e.target.value); setModalErr(''); }}
              style={s.modalInput}
            />

            <div style={s.modalHint}>
              Your plain text password is never stored — only the bcrypt hash.
            </div>

            <div style={s.modalActions}>
              <button style={s.cancelBtn} onClick={() => setModal(null)}>Cancel</button>
              <button
                style={modalLoading ? s.confirmBtnDisabled : s.confirmBtn}
                onClick={handleChangePassword}
                disabled={modalLoading}
              >
                {modalLoading ? 'Updating...' : 'Update password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REMOVE ACCOUNT MODAL ── */}
      {modal === 'remove' && (
        <div style={s.overlay} onClick={() => setModal(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalTitle}>Remove account</div>
            <div style={s.modalSub}>
              This permanently deletes your account and all data from the database. Enter your password to confirm.
            </div>

            {modalErr && <div style={s.modalErr}>{modalErr}</div>}

            <label style={s.modalLabel}>Your password</label>
            <input
              type="password" placeholder="Enter your password to confirm"
              value={removePw}
              onChange={(e) => { setRemovePw(e.target.value); setModalErr(''); }}
              style={s.modalInput}
            />

            <div style={s.modalActions}>
              <button style={s.cancelBtn} onClick={() => setModal(null)}>Cancel</button>
              <button
                style={modalLoading ? s.confirmBtnDangerDisabled : s.confirmBtnDanger}
                onClick={handleRemoveAccount}
                disabled={modalLoading}
              >
                {modalLoading ? 'Removing...' : 'Yes, remove account'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}