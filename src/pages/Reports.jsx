// pages/Reports.jsx
import React from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useCRM } from '../context/CRMContext';
import { STATUS_LABELS, INTERACTION_TYPES } from '../services/constants';
import StatCard from '../components/StatCard';

const COLORS = ['#f59e0b', '#1a56db', '#16a34a', '#9ca3af'];

export default function Reports() {
  const { customers, tasks, interactions } = useCRM();

  const statusData = Object.entries(STATUS_LABELS).map(([k, v]) => ({
    name: v, value: customers.filter(c => c.status === k).length,
  }));

  const taskData = [
    { name: 'Todo', value: tasks.filter(t => t.status === 'todo').length },
    { name: 'Đang làm', value: tasks.filter(t => t.status === 'inprogress').length },
    { name: 'Hoàn thành', value: tasks.filter(t => t.status === 'done').length },
  ];

  const interactionData = Object.entries(INTERACTION_TYPES).map(([k, v]) => ({
    name: v.label, value: interactions.filter(i => i.type === k).length, icon: v.icon,
  }));

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const m = new Date(); m.setMonth(m.getMonth() - (5 - i));
    const key = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`;
    return {
      month: `T${m.getMonth() + 1}`,
      kh: customers.filter(c => c.createdAt?.startsWith(key)).length,
      tt: interactions.filter(i => i.date?.startsWith(key)).length,
    };
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Báo cáo thống kê</h1>
        <p className="page-sub">Tổng quan hiệu suất hệ thống CRM</p>
      </div>

      <div className="grid grid-3 mb-20">
        <StatCard label="Tổng khách hàng" value={customers.length} icon="👥" change="12%" changeDir="up" />
        <StatCard label="Tổng công việc" value={tasks.length} icon="✅" change="8%" changeDir="up" />
        <StatCard label="Tổng tương tác" value={interactions.length} icon="💬" change="15%" changeDir="up" />
      </div>

      {/* Monthly trend */}
      <div className="card mb-20">
        <div className="card-title">Xu hướng 6 tháng gần nhất</div>
        <div style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="kh" stroke="#1a56db" strokeWidth={2} name="Khách hàng mới" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="tt" stroke="#f59e0b" strokeWidth={2} name="Tương tác" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-2 mb-20">
        {/* Customer by status pie */}
        <div className="card">
          <div className="card-title">Khách hàng theo trạng thái</div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tasks bar */}
        <div className="card">
          <div className="card-title">Công việc theo trạng thái</div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskData} barSize={48}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Số lượng">
                  {taskData.map((_, i) => <Cell key={i} fill={['#9ca3af', '#1a56db', '#16a34a'][i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interaction types */}
      <div className="card">
        <div className="card-title">Phân loại tương tác</div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', padding: '8px 0' }}>
          {interactionData.map((d, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', padding: '20px', background: 'var(--gray-50)', borderRadius: 10 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{INTERACTION_TYPES[['call','email','meeting'][i]]?.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)' }}>{d.value}</div>
              <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>{d.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
