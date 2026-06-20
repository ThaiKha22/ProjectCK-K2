// pages/Tasks.jsx
import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { genId } from '../services/storage';
import { TASK_STATUS } from '../services/constants';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { useSearch } from '../hooks/useSearch';

const EMPTY_FORM = { customerId: '', title: '', assignee: '', dueDate: '', status: 'todo' };

export default function Tasks() {
  const { customers, tasks, setTasks } = useCRM();
  const { query, setQuery, filtered: searchFiltered } = useSearch(tasks, ['title', 'assignee']);
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = filterStatus ? searchFiltered.filter(t => t.status === filterStatus) : searchFiltered;

  function openAdd() { setEditItem(null); setForm(EMPTY_FORM); setModalOpen(true); }
  function openEdit(t, e) { e.stopPropagation(); setEditItem(t); setForm({ ...t }); setModalOpen(true); }

  function handleSave() {
    if (!form.title.trim()) return alert('Vui lòng nhập tiêu đề công việc!');
    if (editItem) {
      setTasks(prev => prev.map(t => t.id === editItem.id ? { ...t, ...form } : t));
    } else {
      setTasks(prev => [...prev, { ...form, id: genId('t') }]);
    }
    setModalOpen(false);
  }

  function handleDelete(id, e) {
    e.stopPropagation();
    if (window.confirm('Xoá công việc này?')) setTasks(prev => prev.filter(t => t.id !== id));
  }

  function changeStatus(id, status) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  }

  function set(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })); }

  // Kanban counts
  const counts = Object.keys(TASK_STATUS).reduce((acc, k) => {
    acc[k] = tasks.filter(t => t.status === k).length;
    return acc;
  }, {});

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý công việc</h1>
          <p className="page-sub">{tasks.length} công việc · {counts.done} hoàn thành</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Thêm công việc</button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-3 mb-20">
        {Object.entries(TASK_STATUS).map(([k, v]) => (
          <div key={k} className="stat-card" style={{ cursor: 'pointer' }}
            onClick={() => setFilterStatus(filterStatus === k ? '' : k)}>
            <div className="stat-label">{v}</div>
            <div className="stat-value">{counts[k]}</div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        <div className="search-wrap">
          <span className="si">🔍</span>
          <input className="filter-input" placeholder="Tìm công việc, người phụ trách..." value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <select className="select-filter" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {Object.entries(TASK_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <div className="filter-count">{filtered.length} kết quả</div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Công việc</th><th>Khách hàng</th><th>Phụ trách</th><th>Hạn chót</th><th>Trạng thái</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={6}><div className="empty"><div className="empty-icon">📋</div><p>Không có công việc nào</p></div></td></tr>
                : filtered.map(t => {
                  const cust = customers.find(c => c.id === t.customerId);
                  const isOverdue = t.dueDate && t.status !== 'done' && new Date(t.dueDate) < new Date();
                  return (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600 }}>{t.title}</td>
                      <td>{cust?.name || '—'}</td>
                      <td>{t.assignee || '—'}</td>
                      <td>
                        <span style={{ color: isOverdue ? 'var(--danger)' : 'var(--gray-500)', fontSize: 12, fontWeight: isOverdue ? 600 : 400 }}>
                          {t.dueDate || '—'}{isOverdue ? ' ⚠️' : ''}
                        </span>
                      </td>
                      <td>
                        <select
                          className="form-control"
                          style={{ padding: '4px 8px', fontSize: 12, width: 'auto', minWidth: 120 }}
                          value={t.status}
                          onChange={e => changeStatus(t.id, e.target.value)}
                        >
                          {Object.entries(TASK_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="btn btn-ghost btn-sm" onClick={e => openEdit(t, e)}>✏️ Sửa</button>
                          <button className="btn btn-danger btn-sm" onClick={e => handleDelete(t.id, e)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}
        footer={<><button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Huỷ</button><button className="btn btn-primary" onClick={handleSave}>{editItem ? 'Lưu' : 'Thêm'}</button></>}>
        <div className="form-group">
          <label className="form-label">Tiêu đề *</label>
          <input className="form-control" value={form.title} onChange={set('title')} placeholder="Tên công việc..." />
        </div>
        <div className="form-group">
          <label className="form-label">Khách hàng</label>
          <select className="form-control" value={form.customerId} onChange={set('customerId')}>
            <option value="">-- Chọn khách hàng --</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Người phụ trách</label>
            <input className="form-control" value={form.assignee} onChange={set('assignee')} placeholder="Tên nhân viên" />
          </div>
          <div className="form-group">
            <label className="form-label">Hạn chót</label>
            <input type="date" className="form-control" value={form.dueDate} onChange={set('dueDate')} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Trạng thái</label>
          <select className="form-control" value={form.status} onChange={set('status')}>
            {Object.entries(TASK_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </Modal>
    </div>
  );
}
