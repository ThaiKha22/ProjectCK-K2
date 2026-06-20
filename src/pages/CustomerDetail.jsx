// pages/CustomerDetail.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCRM } from '../context/CRMContext';
import { genId } from '../services/storage';
import { STATUS_LABELS, INTERACTION_TYPES, TASK_STATUS } from '../services/constants';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

const TABS = [
  { id: 'info', label: 'Thông tin' },
  { id: 'interactions', label: 'Tương tác' },
  { id: 'tasks', label: 'Công việc' },
  { id: 'notes', label: 'Ghi chú' },
];

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { customers, setCustomers, interactions, setInteractions, tasks, setTasks } = useCRM();

  const customer = customers.find(c => c.id === id);
  const [tab, setTab] = useState('info');
  const [iModal, setIModal] = useState(false);
  const [tModal, setTModal] = useState(false);
  const [iForm, setIForm] = useState({ type: 'call', content: '', date: new Date().toISOString().slice(0, 10) });
  const [tForm, setTForm] = useState({ title: '', assignee: '', dueDate: '', status: 'todo' });
  const [editStatus, setEditStatus] = useState(false);

  if (!customer) {
    return (
      <div className="empty" style={{ marginTop: 80 }}>
        <div className="empty-icon">❌</div>
        <p>Không tìm thấy khách hàng</p>
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/customers')}>← Quay lại</button>
      </div>
    );
  }

  const custInteractions = interactions
    .filter(i => i?.customerId === id)
    .sort((a, b) => String(b?.date || '').localeCompare(String(a?.date || '')));
  const custTasks = tasks.filter(t => t?.customerId === id);
  const initials = (customer.name || '')
    .split(' ')
    .map(w => w?.[0])
    .filter(Boolean)
    .slice(-2)
    .join('')
    .toUpperCase();

  function addInteraction() {
    if (!iForm.content.trim()) return alert('Vui lòng nhập nội dung!');
    setInteractions(prev => [...prev, { ...iForm, id: genId('i'), customerId: id, createdAt: new Date().toISOString().slice(0, 10) }]);
    setIModal(false);
    setIForm({ type: 'call', content: '', date: new Date().toISOString().slice(0, 10) });
  }

  function addTask() {
    if (!tForm.title.trim()) return alert('Vui lòng nhập tiêu đề!');
    setTasks(prev => [...prev, { ...tForm, id: genId('t'), customerId: id }]);
    setTModal(false);
    setTForm({ title: '', assignee: '', dueDate: '', status: 'todo' });
  }

  function updateTaskStatus(taskId, status) {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
  }

  function updateStatus(newStatus) {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    setEditStatus(false);
  }

  function deleteTask(taskId) {
    if (window.confirm('Xoá công việc này?')) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
    }
  }

  function deleteInteraction(iId) {
    if (window.confirm('Xoá tương tác này?')) {
      setInteractions(prev => prev.filter(i => i.id !== iId));
    }
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <button className="btn-link" onClick={() => navigate('/customers')}>← Danh sách khách hàng</button>
        <span style={{ color: 'var(--gray-400)', margin: '0 8px' }}>/</span>
        <span style={{ color: 'var(--gray-600)' }}>{customer.name}</span>
      </div>

      {/* Header card */}
      <div className="card detail-header-card">
        <div className="detail-hero">
          <div className="detail-avatar">{initials}</div>
          <div className="detail-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h2 className="detail-name">{customer.name}</h2>
              {editStatus
                ? <select className="form-control" style={{ width: 180, padding: '4px 8px' }}
                    defaultValue={customer.status}
                    onChange={e => updateStatus(e.target.value)}
                    onBlur={() => setEditStatus(false)}
                    autoFocus>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                : <span onClick={() => setEditStatus(true)} style={{ cursor: 'pointer' }} title="Click để đổi trạng thái">
                    <Badge value={customer.status} type="status" />
                  </span>
              }
            </div>
            <div className="detail-meta-row">
              <span>🏢 {customer.company}</span>
              <span>📞 {customer.phone}</span>
              <span>📧 {customer.email}</span>
              <span>📅 {customer.createdAt}</span>
            </div>
          </div>
          <div className="detail-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => setIModal(true)}>+ Tương tác</button>
            <button className="btn btn-primary btn-sm" onClick={() => setTModal(true)}>+ Công việc</button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="detail-stats">
          <div className="dstat"><div className="dstat-val">{custInteractions.length}</div><div className="dstat-label">Tương tác</div></div>
          <div className="dstat"><div className="dstat-val">{custTasks.length}</div><div className="dstat-label">Công việc</div></div>
          <div className="dstat"><div className="dstat-val">{custTasks.filter(t => t.status === 'done').length}</div><div className="dstat-label">Hoàn thành</div></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="tabs">
          {TABS.map(t => <div key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</div>)}
        </div>

        {/* Info tab */}
        {tab === 'info' && (
          <div className="info-grid">
            {[
              ['Họ tên', customer.name],
              ['Số điện thoại', customer.phone],
              ['Email', customer.email],
              ['Công ty', customer.company],
              ['Trạng thái', <Badge key="s" value={customer.status} type="status" />],
              ['Ngày tạo', customer.createdAt],
            ].map(([k, v]) => (
              <div key={k} className="info-row">
                <span className="info-key">{k}</span>
                <span className="info-val">{v}</span>
              </div>
            ))}
          </div>
        )}

        {/* Interactions tab */}
        {tab === 'interactions' && (
          <div>
            <div style={{ marginBottom: 14, textAlign: 'right' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setIModal(true)}>+ Thêm tương tác</button>
            </div>
            {custInteractions.length === 0
              ? <div className="empty"><div className="empty-icon">💬</div><p>Chưa có tương tác nào</p></div>
              : custInteractions.map(i => (
                <div key={i.id} className="timeline-item">
                  <div className="tl-icon">
                    {INTERACTION_TYPES[i.type]?.icon || '📌'}
                  </div>
                  <div className="tl-body">
                    <div className="tl-header">
                      <Badge value={i.type} type="interaction" />
                      <span className="tl-date">{i.date}</span>
                      <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => deleteInteraction(i.id)}>🗑️</button>
                    </div>
                    <div className="tl-content">{i.content}</div>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* Tasks tab */}
        {tab === 'tasks' && (
          <div>
            <div style={{ marginBottom: 14, textAlign: 'right' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setTModal(true)}>+ Thêm công việc</button>
            </div>
            {custTasks.length === 0
              ? <div className="empty"><div className="empty-icon">✅</div><p>Chưa có công việc nào</p></div>
              : custTasks.map(t => (
                <div key={t.id} className="list-row">
                  <div>
                    <div className="list-title">{t.title}</div>
                    <div className="list-meta">Phụ trách: {t.assignee || '—'} · Hạn: {t.dueDate || '—'}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <select className="form-control" style={{ padding: '4px 8px', fontSize: 12, width: 'auto' }}
                      value={t.status} onChange={e => updateTaskStatus(t.id, e.target.value)}>
                      {Object.entries(TASK_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <button className="btn btn-ghost btn-sm" onClick={() => deleteTask(t.id)}>🗑️</button>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* Notes tab */}
        {tab === 'notes' && (
          <div>
            <textarea className="form-control" rows={6} placeholder="Nhập ghi chú về khách hàng này..." />
            <button className="btn btn-primary" style={{ marginTop: 12 }}>Lưu ghi chú</button>
          </div>
        )}
      </div>

      {/* Add Interaction Modal */}
      <Modal open={iModal} onClose={() => setIModal(false)} title="Thêm tương tác"
        footer={<><button className="btn btn-ghost" onClick={() => setIModal(false)}>Huỷ</button><button className="btn btn-primary" onClick={addInteraction}>Thêm</button></>}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Loại tương tác</label>
            <select className="form-control" value={iForm.type} onChange={e => setIForm(f => ({ ...f, type: e.target.value }))}>
              {Object.entries(INTERACTION_TYPES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Ngày</label>
            <input type="date" className="form-control" value={iForm.date} onChange={e => setIForm(f => ({ ...f, date: e.target.value }))} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Nội dung *</label>
          <textarea className="form-control" rows={4} value={iForm.content} onChange={e => setIForm(f => ({ ...f, content: e.target.value }))} placeholder="Mô tả chi tiết nội dung tương tác..." />
        </div>
      </Modal>

      {/* Add Task Modal */}
      <Modal open={tModal} onClose={() => setTModal(false)} title="Thêm công việc"
        footer={<><button className="btn btn-ghost" onClick={() => setTModal(false)}>Huỷ</button><button className="btn btn-primary" onClick={addTask}>Thêm</button></>}>
        <div className="form-group">
          <label className="form-label">Tiêu đề *</label>
          <input className="form-control" value={tForm.title} onChange={e => setTForm(f => ({ ...f, title: e.target.value }))} placeholder="Tên công việc..." />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Người phụ trách</label>
            <input className="form-control" value={tForm.assignee} onChange={e => setTForm(f => ({ ...f, assignee: e.target.value }))} placeholder="Nhân viên..." />
          </div>
          <div className="form-group">
            <label className="form-label">Hạn chót</label>
            <input type="date" className="form-control" value={tForm.dueDate} onChange={e => setTForm(f => ({ ...f, dueDate: e.target.value }))} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Trạng thái</label>
          <select className="form-control" value={tForm.status} onChange={e => setTForm(f => ({ ...f, status: e.target.value }))}>
            {Object.entries(TASK_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </Modal>
    </div>
  );
}
