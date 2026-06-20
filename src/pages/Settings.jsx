// pages/Settings.jsx
import React, { useState } from 'react';

export default function Settings() {
  const [profile, setProfile] = useState({ name: 'Admin CRM', email: 'admin@crm.vn', phone: '0901234567', company: 'Công ty CRM' });
  const [saved, setSaved] = useState(false);
  const [pwd, setPwd] = useState({ current: '', new: '', confirm: '' });

  function saveProfile() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function set(field) { return e => setProfile(p => ({ ...p, [field]: e.target.value })); }
  function setPwdField(field) { return e => setPwd(p => ({ ...p, [field]: e.target.value })); }

  const notifications = [
    'Thông báo khi có khách hàng mới',
    'Nhắc nhở hạn chót công việc',
    'Báo cáo tổng hợp hàng tuần',
    'Email thông báo tương tác',
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Cài đặt</h1>
        <p className="page-sub">Quản lý thông tin tài khoản và hệ thống</p>
      </div>

      <div style={{ maxWidth: 720 }}>
        {/* Profile */}
        <div className="card mb-20">
          <div className="settings-section-title">👤 Thông tin tài khoản</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Họ tên</label>
              <input className="form-control" value={profile.name} onChange={set('name')} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" value={profile.email} onChange={set('email')} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              <input className="form-control" value={profile.phone} onChange={set('phone')} />
            </div>
            <div className="form-group">
              <label className="form-label">Công ty</label>
              <input className="form-control" value={profile.company} onChange={set('company')} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={saveProfile}>
            {saved ? '✅ Đã lưu thành công!' : 'Lưu thay đổi'}
          </button>
        </div>

        {/* Security */}
        <div className="card mb-20">
          <div className="settings-section-title">🔒 Bảo mật</div>
          <div className="form-group">
            <label className="form-label">Mật khẩu hiện tại</label>
            <input className="form-control" type="password" value={pwd.current} onChange={setPwdField('current')} placeholder="••••••••" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Mật khẩu mới</label>
              <input className="form-control" type="password" value={pwd.new} onChange={setPwdField('new')} placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu</label>
              <input className="form-control" type="password" value={pwd.confirm} onChange={setPwdField('confirm')} placeholder="••••••••" />
            </div>
          </div>
          <button className="btn btn-ghost" onClick={() => {
            if (pwd.new !== pwd.confirm) return alert('Mật khẩu không khớp!');
            if (!pwd.new) return alert('Vui lòng nhập mật khẩu mới!');
            alert('Đổi mật khẩu thành công!');
            setPwd({ current: '', new: '', confirm: '' });
          }}>Đổi mật khẩu</button>
        </div>

        {/* Notifications */}
        <div className="card mb-20">
          <div className="settings-section-title">🔔 Thông báo</div>
          {notifications.map((n, i) => (
            <div key={i} className="settings-toggle-row">
              <span>{n}</span>
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider" />
              </label>
            </div>
          ))}
        </div>

        {/* Danger zone */}
        <div className="card" style={{ borderColor: '#fee2e2' }}>
          <div className="settings-section-title" style={{ color: 'var(--danger)' }}>⚠️ Vùng nguy hiểm</div>
          <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 12 }}>
            Xoá toàn bộ dữ liệu sẽ không thể khôi phục. Hãy sao lưu trước khi thực hiện.
          </p>
          <button className="btn btn-danger" onClick={() => {
            if (window.confirm('Bạn có chắc chắn muốn xoá tất cả dữ liệu? Hành động này không thể hoàn tác!')) {
              localStorage.clear();
              window.location.reload();
            }
          }}>Xoá toàn bộ dữ liệu</button>
        </div>
      </div>
    </div>
  );
}
