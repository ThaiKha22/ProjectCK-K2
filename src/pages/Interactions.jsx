// pages/Interactions.jsx
import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { genId } from '../services/storage';
import { INTERACTION_TYPES } from '../services/constants';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

const EMPTY_FORM = { customerId: '', type: 'call', content: '', date: new Date().toISOString().slice(0, 10) };

export default function Interactions() {
  const { customers, interactions, setInteractions } = useCRM();
  const [q, setQ] = useState('');
  const [filterType, setFilterType] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = interactions
    .filter(i => {
      const cust = customers.find(c => c.id === i.customerId);
      const matchQ = !q
        || (cust?.name || '').toLowerCase().includes(q.toLowerCase())
        || (i.content || '').toLowerCase().includes(q.toLowerCase());
      const matchType = !filterType || i.type === filterType;
      return matchQ && matchType;
    })
    .sort((a, b) => String(b?.date || '').localeCompare(String(a?.date || '')));

  function handleSave() {
    if (!form.customerId) return alert('Vui lòng chọn khách hàng!');
    if (!form.content.trim()) return alert('Vui lòng nhập nội dung!');
    setInteractions(prev => [...prev, { ...form, id: genId('i'), createdAt: new Date().toISOString().slice(0, 10) }]);
    setModalOpen(false);
    setForm(EMPTY_FORM);
  }

  function handleDelete(id) {
    if (window.confirm('Xoá tương tác này?')) {
      setInteractions(prev => prev.filter(i => i.id !== id));
    }
  }

  function set(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })); }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Lịch sử tương tác</h1>
          <p className="page-sub">{interactions.length} tương tác được ghi nhận</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY_FORM); setModalOpen(true); }}>
          + Thêm tương tác
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-wrap">
          <span className="si">🔍</span>
          <input className="filter-input" placeholder="Tìm khách hàng, nội dung..." value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <select className="select-filter" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">Tất cả loại</option>
          {Object.entries(INTERACTION_TYPES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
        </select>
        <div className="filter-count">{filtered.length} kết quả</div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Ngày</th><th>Khách hàng</th><th>Loại</th><th>Nội dung</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={5}><div className="empty"><div className="empty-icon">💬</div><p>Không có tương tác nào</p></div></td></tr>
                : filtered.map(i => {
                  const cust = customers.find(c => c.id === i.customerId);
                  return (
                    <tr key={i.id}>
                      <td className="text-meta" style={{ whiteSpace: 'nowrap' }}>{i.date}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="table-avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                            {(cust?.name || '').slice(-1).toUpperCase() || '?'}
                          </div>
                          <span style={{ fontWeight: 600 }}>{cust?.name || '—'}</span>
                        </div>
                      </td>
                      <td><Badge value={i.type} type="interaction" /></td>
                      <td style={{ maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {i.content}
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(i.id)}>🗑️</button>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Thêm tương tác mới"
        footer={<><button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Huỷ</button><button className="btn btn-primary" onClick={handleSave}>Thêm</button></>}>
        <div className="form-group">
          <label className="form-label">Khách hàng *</label>
          <select className="form-control" value={form.customerId} onChange={set('customerId')}>
            <option value="">-- Chọn khách hàng --</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Loại tương tác</label>
            <select className="form-control" value={form.type} onChange={set('type')}>
              {Object.entries(INTERACTION_TYPES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Ngày</label>
            <input type="date" className="form-control" value={form.date} onChange={set('date')} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Nội dung *</label>
          <textarea className="form-control" rows={4} value={form.content} onChange={set('content')} placeholder="Mô tả chi tiết nội dung tương tác..." />
        </div>
      </Modal>
    </div>
  );
}
