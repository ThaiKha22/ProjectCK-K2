// pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loginError, setLoginError, loading, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ username: false, password: false });
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  function set(field) {
    return e => {
      setForm(f => ({ ...f, [field]: e.target.value }));
      setLoginError('');
    };
  }

  function blur(field) {
    return () => setTouched(t => ({ ...t, [field]: true }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ username: true, password: true });

    if (!form.username.trim() || !form.password) return;

    try {
      await login(form.username, form.password);
      navigate('/', { replace: true });
    } catch {
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  }

  const usernameErr = touched.username && !form.username.trim() ? 'Vui lòng nhập username' : '';
  const passwordErr = touched.password && !form.password ? 'Vui lòng nhập mật khẩu' : '';

  return (
    <div className="login-page">
      {/* Left panel — branding */}
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo">CRM</div>
          <h1 className="login-tagline">Quản lý khách hàng<br />thông minh hơn</h1>
          <p className="login-desc">
            Theo dõi khách hàng, công việc và tương tác — tất cả trong một nơi.
          </p>
        </div>

        {/* Feature pills */}
        <div className="login-features">
          {[
            { icon: '👥', label: 'Quản lý khách hàng' },
            { icon: '✅', label: 'Theo dõi công việc' },
            { icon: '📊', label: 'Báo cáo thống kê' },
            { icon: '📅', label: 'Lịch & nhắc nhở' },
          ].map((f, i) => (
            <div key={i} className="feature-pill">
              <span>{f.icon}</span> {f.label}
            </div>
          ))}
        </div>

        {/* Decorative circles */}
        <div className="deco-circle deco-1" />
        <div className="deco-circle deco-2" />
        <div className="deco-circle deco-3" />
      </div>

      {/* Right panel — form */}
      <div className="login-right">
        <div className={`login-card ${shake ? 'shake' : ''}`}>
          {/* Header */}
          <div className="login-card-header">
            <div className="login-card-logo">C</div>
            <h2 className="login-card-title">Đăng nhập CRM</h2>
            <p className="login-card-sub">Nhập thông tin tài khoản để tiếp tục</p>
          </div>

          {/* Error banner */}
          {loginError && (
            <div className="login-error-banner">
              <span>⚠️</span> {loginError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Username / Email */}
            <div className="lf-group">
              <label className="lf-label">Username</label>
              <div className={`lf-input-wrap ${usernameErr ? 'has-error' : ''}`}>
                <span className="lf-icon">👤</span>
                <input
                  className="lf-input"
                  type="text"
                  placeholder="Nhập username"
                  value={form.username}
                  onChange={set('username')}
                  onBlur={blur('username')}
                  autoComplete="username"
                  autoFocus
                  disabled={loading}
                />
              </div>
              {usernameErr && <p className="lf-err">{usernameErr}</p>}
            </div>

            {/* Password */}
            <div className="lf-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="lf-label">Mật khẩu</label>
                <button type="button" className="lf-forgot" onClick={() => alert('Tính năng sẽ có trong phiên bản tới!')}>
                  Quên mật khẩu?
                </button>
              </div>
              <div className={`lf-input-wrap ${passwordErr ? 'has-error' : ''}`}>
                <span className="lf-icon">🔒</span>
                <input
                  className="lf-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu..."
                  value={form.password}
                  onChange={set('password')}
                  onBlur={blur('password')}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="lf-eye"
                  onClick={() => setShowPassword(s => !s)}
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {passwordErr && <p className="lf-err">{passwordErr}</p>}
            </div>

            {/* Remember me */}
            <div className="lf-remember">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" style={{ width: 15, height: 15, accentColor: 'var(--primary)' }} />
                <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>Ghi nhớ đăng nhập</span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`lf-submit ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <span className="spinner" /> Đang đăng nhập...
                </span>
              ) : 'Đăng nhập'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
