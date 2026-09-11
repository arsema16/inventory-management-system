import { ReactNode } from 'react';

interface AlertProps {
  variant?: 'success' | 'warning' | 'danger' | 'info';
  children: ReactNode;
  onClose?: () => void;
}

export default function Alert({ variant = 'info', children, onClose }: AlertProps) {
  const variantClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-orange-50 border-orange-200 text-orange-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const icons = {
    success: '✓',
    warning: '⚠',
    danger: '✕',
    info: 'ℹ',
  };

  return (
    <div className={`border rounded-lg p-4 flex items-start ${variantClasses[variant]}`}>
      <span className="text-xl mr-3">{icons[variant]}</span>
      <div className="flex-1">{children}</div>
      {onClose && (
        <button onClick={onClose} className="ml-3 text-gray-500 hover:text-gray-700">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
