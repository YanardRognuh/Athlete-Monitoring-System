import { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

const toastStyles = {
  success: {
    container: "bg-green-50 border-green-200 text-green-800",
    icon: CheckCircle,
    iconColor: "text-green-600",
  },
  error: {
    container: "bg-red-50 border-red-200 text-red-800",
    icon: AlertCircle,
    iconColor: "text-red-600",
  },
  warning: {
    container: "bg-yellow-50 border-yellow-200 text-yellow-800",
    icon: AlertTriangle,
    iconColor: "text-yellow-600",
  },
  info: {
    container: "bg-blue-50 border-blue-200 text-blue-800",
    icon: Info,
    iconColor: "text-blue-600",
  },
};

export function Toast({ message, type = "info", onClose, duration = 3000 }) {
  const style = toastStyles[type] || toastStyles.info;
  const Icon = style.icon;

  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md w-full border rounded-lg shadow-lg p-4 flex items-start space-x-3 animate-slide-in ${style.container}`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${style.iconColor}`} />
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 transition hover:opacity-70"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Toast container component for managing multiple toasts
export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed z-50 space-y-2 top-4 right-4">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </div>
  );
}
