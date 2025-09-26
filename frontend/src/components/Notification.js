import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info
} from 'lucide-react';

const Notification = ({
  type = 'info',
  title,
  message,
  isVisible = true,
  duration = 5000,
  onClose
}) => {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(() => onClose?.(), 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose?.(), 300);
  };

  const variant = type;

  const iconMap = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info
  };

  const Icon = iconMap[variant] || Info;

  if (!show) return null;

  return (
    <div className={`notification notification--${variant} ${show ? '' : 'is-exiting'}`} role="status" aria-live="polite">
      <div className="notification__decor" aria-hidden="true"></div>
      <div className="notification__content">
        <div className="notification__icon">
          <Icon size={18} />
        </div>
        <div className="notification__body">
          {title && <h4 className="notification__title">{title}</h4>}
          <p className="notification__message">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="notification__close"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Notification;
