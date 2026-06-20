// pages/Dashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useCRM } from '../context/CRMContext';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';

const MONTH_DATA = [
  { month: 'T1', kh: 4, ct: 6 }, { month: 'T2', kh: 6, ct: 8 },
  { month: 'T3', kh: 5, ct: 10 }, { month: 'T4', kh: 8, ct: 12 },
  { month: 'T5', kh: 5, ct: 15 }, { month: 'T6', kh: 3, ct: 9 },
];

const PIE_COLORS = ['#9ca3af', '#1a56db', '#16a34a'];

export default function Dashboard() {
  const { customers, tasks, interactions } = useCRM();
  const navigate = useNavigate();

  const total = customers.length;
  const leads = customers.filter(c => c.status === 'tiem-nang').length;
  const clients = customers.filter(c => c.status === 'khach-hang').length;
  const done = tasks.filter(t => t.status === 'done').length;

  const taskPie = [
    { name: 'Todo', value: tasks.filter(t => t.status === 'todo').length },
    { name: 'Đang làm', value: tasks.filter(t => t.status === 'inprogress').length },
    { name: 'Hoàn thành', value: done },
  ];

  const upcoming = tasks.filter(t => t.status !== 'done').slice(0, 5);
  const recentInteractions = [...interactions]
    .sort((a, b) => {
      const aDate = a?.date || a?.createdAt || '';
      const bDate = b?.date || b?.createdAt || '';
      return String(bDate).localeCompare(String(aDate));
    })
    .slice(0, 5);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-sub">Tổng quan hệ thống CRM</p>
      </div>

      {/* Stats */}
      <div className="grid grid-4 mb-20">
        <StatCard label="Tổng khách hàng" value={total} change="12%" changeDir="up" icon="👥" />
        <StatCard label="Tiềm năng" value={leads} change="8%" changeDir="up" icon="⭐" />
        <StatCard label="Đã chốt" value={clients} change="20%" changeDir="up" icon="🏆" />
        <StatCard label="Task hoàn thành" value={done} change="5%" changeDir="up" icon="✅" />
      </div>

      {/* Charts row */}
      <div className="grid grid-2 mb-20">
        <div className="card">
          <div className="card-title">Khách hàng mới theo tháng</div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MONTH_DATA}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="kh" stroke="#1a56db" strokeWidth={2.5} dot={{ r: 3 }} name="Khách hàng" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Trạng thái công việc</div>
          <div style={{ display: 'flex', alignItems: 'center', height: 200 }}>
            <ResponsiveContainer width="55%" height="100%">
              <PieChart>
                <Pie data={taskPie} cx="50%" cy="50%" innerRadius={48} outerRadius={76} dataKey="value">
                  {taskPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {taskPie.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 12 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: PIE_COLORS[i], display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ color: 'var(--gray-600)' }}>{p.name}</span>
                  <span style={{ fontWeight: 700, marginLeft: 'auto' }}>{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming tasks + Recent interactions */}
      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">
            Công việc sắp tới
            <button className="btn-link" onClick={() => navigate('/tasks')}>Xem tất cả →</button>
          </div>
          {upcoming.length === 0
            ? <div className="empty"><div className="empty-icon">✅</div><p>Không có công việc pending!</p></div>
            : upcoming.map(t => {
              const cust = customers.find(c => c.id === t.customerId);
              return (
                <div key={t.id} className="list-row">
                  <div>
                    <div className="list-title">{t.title}</div>
                    <div className="list-meta">{cust?.name || '—'} · {t.dueDate || 'Chưa có hạn'}</div>
                  </div>
                  <Badge value={t.status} type="task" />
                </div>
              );
            })
          }
        </div>

        <div className="card">
          <div className="card-title">
            Tương tác gần đây
            <button className="btn-link" onClick={() => navigate('/interactions')}>Xem tất cả →</button>
          </div>
          {recentInteractions.length === 0
            ? <div className="empty"><div className="empty-icon">💬</div><p>Không có tương tác gần đây</p></div>
            : recentInteractions.map(i => {
              const cust = customers.find(c => c.id === i.customerId);
              const interactionDate = i.date || i.createdAt || '—';
              return (
                <div key={i.id} className="list-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span className="list-title">{cust?.name || '—'}</span>
                    <Badge value={i.type} type="interaction" />
                  </div>
                  <div className="list-meta">{i.content?.slice(0, 60)}{i.content && i.content.length > 60 ? '…' : ''}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{interactionDate}</div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
