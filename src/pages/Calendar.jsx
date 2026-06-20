// pages/Calendar.jsx
import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { MONTH_NAMES, DAY_NAMES, INTERACTION_TYPES } from '../services/constants';

export default function Calendar() {
  const { tasks, interactions, customers } = useCRM();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  // Build 42-cell grid
  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrev - i, thisMonth: false, dateStr: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, thisMonth: true, dateStr });
  }
  while (cells.length < 42) {
    cells.push({ day: cells.length - daysInMonth - firstDay + 2, thisMonth: false, dateStr: null });
  }

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  function getEvents(dateStr) {
    if (!dateStr) return [];
    const evs = [];
    tasks.filter(t => t.dueDate === dateStr).forEach(t => {
      const c = customers.find(x => x.id === t.customerId);
      evs.push({ type: 'task', label: `📋 ${t.title}${c ? ' · ' + c.name : ''}`, status: t.status });
    });
    interactions.filter(i => i.date === dateStr).forEach(i => {
      const c = customers.find(x => x.id === i.customerId);
      const t = INTERACTION_TYPES[i.type];
      evs.push({ type: 'interaction', label: `${t?.icon || '📌'} ${c?.name || ''}` });
    });
    return evs;
  }

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }

  const selectedEvents = selectedDay ? getEvents(selectedDay) : [];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Lịch</h1>
        <p className="page-sub">Xem công việc & tương tác theo thời gian</p>
      </div>

      <div className="card">
        {/* Nav */}
        <div className="cal-nav">
          <button className="btn btn-ghost btn-sm" onClick={prevMonth}>‹ Trước</button>
          <h3 className="cal-month-title">{MONTH_NAMES[month]} {year}</h3>
          <button className="btn btn-ghost btn-sm" onClick={nextMonth}>Sau ›</button>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}
            onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDay(todayStr); }}>
            Hôm nay
          </button>
        </div>

        {/* Day headers */}
        <div className="cal-grid">
          {DAY_NAMES.map(d => <div key={d} className="cal-header-cell">{d}</div>)}

          {cells.map((cell, i) => {
            const evs = getEvents(cell.dateStr);
            const isToday = cell.dateStr === todayStr;
            const isSelected = cell.dateStr === selectedDay;
            return (
              <div
                key={i}
                className={`cal-cell ${!cell.thisMonth ? 'other-month' : ''} ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}`}
                onClick={() => cell.dateStr && setSelectedDay(cell.dateStr === selectedDay ? null : cell.dateStr)}
              >
                <div className={`cal-day-num ${isToday ? 'today-num' : ''}`}>{cell.day}</div>
                {evs.slice(0, 2).map((e, j) => (
                  <div key={j} className={`cal-event-pill ${e.type}`}>{e.label}</div>
                ))}
                {evs.length > 2 && <div className="cal-more">+{evs.length - 2}</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Day detail panel */}
      {selectedDay && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-title">
            Sự kiện ngày {selectedDay}
            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedDay(null)}>✕</button>
          </div>
          {selectedEvents.length === 0
            ? <div className="empty"><div className="empty-icon">📅</div><p>Không có sự kiện nào ngày này</p></div>
            : selectedEvents.map((e, i) => (
              <div key={i} className="list-row">
                <span style={{ fontSize: 14 }}>{e.label}</span>
                {e.status && <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{e.status}</span>}
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}
