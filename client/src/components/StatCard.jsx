import React from 'react';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  color = 'primary',
  subtext,
  badge,
  onClick,
}) => {
  const colorMap = {
    primary: {
      bg: 'rgba(99, 102, 241, 0.12)',
      text: '#818cf8',
      border: 'rgba(99, 102, 241, 0.3)',
      glow: 'rgba(99, 102, 241, 0.2)',
    },
    secondary: {
      bg: 'rgba(6, 182, 212, 0.12)',
      text: '#38bdf8',
      border: 'rgba(6, 182, 212, 0.3)',
      glow: 'rgba(6, 182, 212, 0.2)',
    },
    success: {
      bg: 'rgba(16, 185, 129, 0.12)',
      text: '#34d399',
      border: 'rgba(16, 185, 129, 0.3)',
      glow: 'rgba(16, 185, 129, 0.2)',
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.12)',
      text: '#fbbf24',
      border: 'rgba(245, 158, 11, 0.3)',
      glow: 'rgba(245, 158, 11, 0.2)',
    },
    danger: {
      bg: 'rgba(244, 63, 94, 0.12)',
      text: '#fb7185',
      border: 'rgba(244, 63, 94, 0.3)',
      glow: 'rgba(244, 63, 94, 0.2)',
    },
    purple: {
      bg: 'rgba(168, 85, 247, 0.12)',
      text: '#c084fc',
      border: 'rgba(168, 85, 247, 0.3)',
      glow: 'rgba(168, 85, 247, 0.2)',
    },
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <div
      className="glass-card"
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: scheme.bg,
              border: `1px solid ${scheme.border}`,
              color: scheme.text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 12px ${scheme.glow}`,
            }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          {value}
        </div>
        {badge && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: scheme.bg,
              color: scheme.text,
              border: `1px solid ${scheme.border}`,
            }}
          >
            {badge}
          </span>
        )}
      </div>

      {subtext && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          {subtext}
        </div>
      )}
    </div>
  );
};
