import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { Notification } from '../types';

interface NotificationToastProps {
  notifications: Notification[];
  removeNotification: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      {notifications.map((notif) => (
        <ToastItem key={notif.id} notification={notif} onRemove={() => removeNotification(notif.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ notification: Notification; onRemove: () => void }> = ({ notification, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 5000); // Auto dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [onRemove]);

  const getStyles = () => {
    switch (notification.type) {
      case 'SUCCESS':
        return 'bg-white dark:bg-gray-800 border-l-4 border-emerald-500 text-gray-800 dark:text-gray-100';
      case 'ERROR':
        return 'bg-white dark:bg-gray-800 border-l-4 border-red-500 text-gray-800 dark:text-gray-100';
      case 'INFO':
        return 'bg-white dark:bg-gray-800 border-l-4 border-blue-500 text-gray-800 dark:text-gray-100';
      default:
        return 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100';
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'SUCCESS':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'ERROR':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'INFO':
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-xl min-w-[300px] max-w-sm animate-in slide-in-from-right duration-300 ${getStyles()}`}>
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
      <div className="flex-1">
        <p className="text-sm font-semibold">{notification.type === 'SUCCESS' ? 'Success' : notification.type === 'ERROR' ? 'Error' : 'Info'}</p>
        <p className="text-sm opacity-90">{notification.message}</p>
      </div>
      <button onClick={onRemove} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
        <X size={16} />
      </button>
    </div>
  );
};

export default NotificationToast;