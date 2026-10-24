import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export const NotificationToast = () => {
  const { toastMessage } = useAuth();

  if (!toastMessage) return null;

  const { message, type } = toastMessage;

  const config = {
    success: {
      bg: 'rgba(16, 185, 129, 0.95)',
      color: '#ffffff',
      icon: CheckCircle2,
      shadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
    },
    danger: {
      bg: 'rgba(244, 63, 94, 0.95)',
      color: '#ffffff',
      icon: AlertCircle,
      shadow: '0 8px 24px rgba(244, 63, 94, 0.4)',
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.95)',
      color: '#ffffff',
      icon: AlertTriangle,
      shadow: '0 8px 24px rgba(245, 158, 11, 0.4)',
    },
    info: {
      bg: 'rgba(99, 102, 241, 0.95)',
      color: '#ffffff',
      icon: Info,
      shadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
    },
  }[type] || {
    bg: '#1e293b',
    color: '#ffffff',
    icon: Info,
    shadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
  };

  const Icon = config.icon;

  return (
    <div
      className="toast"
      style={{
        background: config.bg,
        color: config.color,
        boxShadow: config.shadow,
        backdropFilter: 'blur(8px)',
      }}
    >
      <Icon size={18} />
      <span>{message}</span>
    </div>
  );
};
