import React, { useEffect, useState } from 'react';

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

  const typeClass = {
    success: 'notification-success',
    error: 'notification-error',
    warning: 'notification-warning',
    info: 'notification-info'
  }[type] || 'notification-info';

  if (!show) return null;

  return (
    <div
      className={`notification ${typeClass} ${show ? 'notification-enter' : 'notification-exit'}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="notification-title">{title}</h4>
          )}
          <p className="notification-message">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="notification-close"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Notification;
