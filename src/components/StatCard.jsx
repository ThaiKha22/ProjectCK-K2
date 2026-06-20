// components/StatCard.jsx
import React from 'react';

export default function StatCard({ label, value, change, changeDir = 'up', icon }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        {icon && <span className="stat-icon">{icon}</span>}
        <div className="stat-label">{label}</div>
      </div>
      <div className="stat-value">{value}</div>
      {change && (
        <span className={`stat-change ${changeDir}`}>
          {changeDir === 'up' ? '↑' : '↓'} {change}
        </span>
      )}
    </div>
  );
}
