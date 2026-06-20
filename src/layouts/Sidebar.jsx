// layouts/Sidebar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/customers', label: 'Khách hàng', icon: '👥' },
  { path: '/interactions', label: 'Tương tác', icon: '💬' },
  { path: '/tasks', label: 'Công việc', icon: '✅' },
  { path: '/calendar', label: 'Lịch', icon: '📅' },
  { path: '/reports', label: 'Báo cáo', icon: '📈' },
];

const BOTTOM_ITEMS = [
  { path: '/settings', label: 'Cài đặt', icon: '⚙️' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  function isActive(path) {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  }

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <div className="logo-mark">CRM</div>
        <div>
          <div className="logo-title">CRM System</div>
          <div className="logo-sub">Quản lý khách hàng</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">MENU CHÍNH</div>
        {NAV_ITEMS.map(item => (
          <button
            key={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}

        <div className="nav-section-label" style={{ marginTop: 24 }}>HỆ THỐNG</div>
        {BOTTOM_ITEMS.map(item => (
          <button
            key={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div className="sidebar-user" style={{ flex: 1, minWidth: 0 }}>
            <div className="avatar-sm">{user?.avatar || 'A'}</div>
            <div style={{ minWidth: 0 }}>
              <div className="user-name">{user?.name || 'Admin'}</div>
              <div className="user-email">{user?.email || 'admin@crm.vn'}</div>
            </div>
          </div>
          <button
            className="icon-btn logout-btn"
            onClick={handleLogout}
            title="Đăng xuất"
            aria-label="Đăng xuất"
            style={{ flexShrink: 0 }}
          >
            <img src="/src/assets/logout-svgrepo-com.svg" alt="Logout" style={{ width: 18, height: 18 }} />
          </button>
        </div>
      </div>
    </aside>
  );
}
