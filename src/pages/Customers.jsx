// pages/Customers.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '../context/CRMContext';
import { createCustomer, updateCustomer, deleteCustomer } from '../services/storage';
import { STATUS_LABELS } from '../services/constants';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { useSearch } from '../hooks/useSearch';
import { useAuth } from '../context/AuthContext';

const EMPTY_FORM = { name: '', phone: '', email: '', company: '', status: 'tiem-nang' };

export default function Customers() {
  const { customers, setCustomers } = useCRM();
  const navigate = useNavigate();
  const { query, setQuery, filtered } = useSearch(customers, ['name', 'phone', 'email', 'company']);
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const displayed = filterStatus ? filtered.filter(c => c.status === filterStatus) : filtered;
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  function openAdd() {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(c, e) {
    e.stopPropagation();
    setEditItem(c);
    setForm({ ...c });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return alert('Vui lòng nhập tên khách hàng!');

    try {
      if (editItem) {
        const updatedCustomer = await updateCustomer(editItem.id, form);
        setCustomers(prev => prev.map(c => c.id === editItem.id ? updatedCustomer[0] : c));
      } else {
        const createdCustomers = await createCustomer(form);
        if (createdCustomers.length > 0) {
          setCustomers(prev => [...prev, createdCustomers[0]]);
        }
      }
      setModalOpen(false);
    } catch (error) {
      console.error('Create customer error:', error);
      alert('Không thể tạo khách hàng. Vui lòng thử lại!');
    }
  }

  function handleDelete(id, e) {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc muốn xoá khách hàng này?')) {
      deleteCustomer(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
    }
  }

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Khách hàng</h1>
          <p className="page-sub">{customers.length} khách hàng trong hệ thống</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openAdd}>+ Thêm khách hàng</button>
        )}
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="search-wrap">
          <span className="si">🔍</span>
          <input className="filter-input" placeholder="Tìm tên, email, SĐT, công ty..." value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <select className="select-filter" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <div className="filter-count">{displayed.length} kết quả</div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Họ tên</th><th>SĐT</th><th>Email</th><th>Công ty</th><th>Trạng thái</th><th>Ngày tạo</th>{isAdmin && <th>Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0
                ? <tr><td colSpan={7}><div className="empty"><div className="empty-icon">👥</div><p>Không tìm thấy khách hàng nào</p></div></td></tr>
                : displayed.map(c => (
                  <tr key={c.id} onClick={() => navigate(`/customers/${c.id}`)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="table-avatar">{String(c.name || '').slice(-1).toUpperCase() || '?'}</div>
                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{c.name || '—'}</span>
                      </div>
                    </td>
                    <td>{c.phone || '—'}</td>
                    <td>{c.email || '—'}</td>
                    <td>{c.company || '—'}</td>
                    <td><Badge value={c.status} type="status" /></td>
                    <td className="text-meta">{c.createdAt || '—'}</td>
                    {isAdmin && (
                      <td>
                        <div className="action-btns" onClick={e => e.stopPropagation()}>
                          <button className="btn btn-ghost btn-sm" onClick={e => openEdit(c, e)}>✏️ Sửa</button>
                          <button className="btn btn-danger btn-sm" onClick={e => handleDelete(c.id, e)}>🗑️</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Huỷ</button>
            <button className="btn btn-primary" onClick={handleSave}>{editItem ? 'Lưu thay đổi' : 'Thêm mới'}</button>
          </>
        }
      >
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Họ tên *</label>
            <input className="form-control" value={form.name} onChange={set('name')} placeholder="Nguyễn Văn A" />
          </div>
          <div className="form-group">
            <label className="form-label">Số điện thoại</label>
            <input className="form-control" value={form.phone} onChange={set('phone')} placeholder="0901234567" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" value={form.email} onChange={set('email')} placeholder="email@gmail.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Công ty</label>
            <input className="form-control" value={form.company} onChange={set('company')} placeholder="Tên công ty" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Trạng thái</label>
          <select className="form-control" value={form.status} onChange={set('status')}>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </Modal>
    </div>
  );
}
