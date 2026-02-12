import React from 'react';

const StatsCard = ({ title, value, icon, color, trend }) => {
  return (
    <div className={`stats-card stats-${color}`}>
      <div className="stats-header">
        <div className="stats-info">
          <p className="stats-title">{title}</p>
          <h3 className="stats-value">{value}</h3>
        </div>
        <div className="stats-icon">
          {icon}
        </div>
      </div>
      {trend && (
        <div className="stats-trend">
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
