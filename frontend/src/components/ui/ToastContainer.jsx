import { useNotification } from '../../contexts/NotificationContext';
import Toast from './Toast';

export default function ToastContainer() {
  const { notifications, dismiss } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {notifications.map(n => (
        <Toast key={n.id} id={n.id} type={n.type} message={n.message} onDismiss={dismiss} />
      ))}
    </div>
  );
}
