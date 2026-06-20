// layouts/MainLayout.jsx
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useCRM } from '../context/CRMContext';
import { useAuth } from '../context/AuthContext';

export default function MainLayout() {
  const [searchQ, setSearchQ] = useState('');
  const navigate = useNavigate();
  const { customers } = useCRM();
  const { user, logout } = useAuth();

  const results = searchQ.trim()
    ? customers.filter(c =>
        String(c.name || '').toLowerCase().includes(searchQ.toLowerCase()) ||
        String(c.email || '').toLowerCase().includes(searchQ.toLowerCase()) ||
        String(c.phone || '').includes(searchQ)
      ).slice(0, 5)
    : [];

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-search">
            <span className="search-icon">🔍</span>
            <input
              className="topbar-input"
              placeholder="Tìm kiếm khách hàng..."
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              onBlur={() => setTimeout(() => setSearchQ(''), 200)}
            />
            {results.length > 0 && (
              <div className="search-dropdown">
                {results.map(c => (
                  <div
                    key={c.id}
                    className="search-result-item"
                    onMouseDown={() => {
                      setSearchQ('');
                      navigate(`/customers/${c.id}`);
                    }}
                  >
                    <span className="sr-name">{c.name}</span>
                    <span className="sr-meta">{c.phone} · {c.email}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="topbar-right">
            <button className="icon-btn" title="Thông báo">🔔</button>
            <div className="avatar-sm" style={{ cursor: 'pointer' }} title={user?.name || 'User'}>
              {user?.avatar || 'A'}
            </div>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
