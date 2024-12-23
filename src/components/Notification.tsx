import { useEffect } from 'react';
import './Notification.css';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Notification = ({ message, type, onClose }: NotificationProps) => {
  return (
    <div className={`
      fixed bottom-4 right-4 p-4 rounded-lg
      ${type === 'success' ? 'bg-[rgba(34,255,158,0.1)] border-[rgb(34,255,158,0.3)]' : 'bg-[rgba(255,68,68,0.1)] border-[rgba(255,68,68,0.3)]'}
      border shadow-lg text-white
    `}>
      {message}
      <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100">×</button>
    </div>
  );
};

export default Notification; 