import { Toast } from '../hooks/useToast';
import Alert from './Alert';

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export default function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-96">
      {toasts.map((toast) => (
        <Alert
          key={toast.id}
          variant={toast.variant === 'error' ? 'danger' : toast.variant}
          onClose={() => onClose(toast.id)}
        >
          {toast.message}
        </Alert>
      ))}
    </div>
  );
}
