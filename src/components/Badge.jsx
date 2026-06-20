// components/Badge.jsx
import React from 'react';
import { STATUS_LABELS, STATUS_COLORS, TASK_STATUS, TASK_COLORS, INTERACTION_TYPES } from '../services/constants';

export default function Badge({ value, type = 'status' }) {
  let label, style;

  if (type === 'status') {
    label = STATUS_LABELS[value] || value;
    const c = STATUS_COLORS[value] || STATUS_COLORS['ngung'];
    style = { background: c.bg, color: c.color };
  } else if (type === 'task') {
    label = TASK_STATUS[value] || value;
    const c = TASK_COLORS[value] || TASK_COLORS['todo'];
    style = { background: c.bg, color: c.color };
  } else if (type === 'interaction') {
    const t = INTERACTION_TYPES[value];
    label = t ? `${t.icon} ${t.label}` : value;
    style = t ? { background: t.bg, color: t.color } : {};
  }

  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '100px',
      fontSize: '11.5px',
      fontWeight: 600,
      whiteSpace: 'nowrap',
      ...style,
    }}>
      {label}
    </span>
  );
}
