import { useEffect } from 'react';
import './Notification.css';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Notification = ({ message, type, onClose }: NotificationProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`notification-container ${type}`}>
      <div className="notification-content">
        <span className="notification-icon">
          {type === 'success' ? '✓' : '✕'}
        </span>
        <span className="notification-message">{message}</span>
      </div>
    </div>
  );
};

export default Notification; 