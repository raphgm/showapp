
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  createdAt: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: ToastType;
  timestamp: number;
  read: boolean;
}

interface ToastContextValue {
  addToast: (message: string, type?: ToastType) => void;
  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => void;
  clearNotifications: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

const TOAST_ICONS: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const TOAST_STYLES: Record<ToastType, string> = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-rose-50 border-rose-200 text-rose-800',
  info: 'bg-indigo-50 border-indigo-200 text-indigo-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
};

const TOAST_ICON_STYLES: Record<ToastType, string> = {
  success: 'text-emerald-500',
  error: 'text-rose-500',
  info: 'text-indigo-500',
  warning: 'text-amber-500',
};

const MAX_VISIBLE = 3;
const AUTO_DISMISS_MS = 4000;

const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const Icon = TOAST_ICONS[toast.type];
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg backdrop-blur-sm min-w-[320px] max-w-[420px] transition-all duration-300 ${
        TOAST_STYLES[toast.type]
      } ${isExiting ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'}`}
      style={{ animation: isExiting ? undefined : 'slideInRight 0.3s ease-out' }}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${TOAST_ICON_STYLES[toast.type]}`} />
      <p className="text-sm font-semibold flex-1">{toast.message}</p>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onDismiss(toast.id), 300);
        }}
        className="p-1 rounded-lg hover:bg-black/5 transition-colors flex-shrink-0"
      >
        <X className="w-3.5 h-3.5 opacity-50" />
      </button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const idCounter = useRef(0);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${++idCounter.current}-${Date.now()}`;
    const newToast: Toast = { id, message, type, createdAt: Date.now() };
    setToasts((prev) => [...prev.slice(-(MAX_VISIBLE - 1)), newToast]);

    // Also add to notifications history
    setNotifications((prev) => [
      {
        id,
        title: type.charAt(0).toUpperCase() + type.slice(1),
        message,
        type,
        timestamp: Date.now(),
        read: false,
      },
      ...prev.slice(0, 49), // Keep last 50
    ]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, notifications, unreadCount, markAllRead, clearNotifications }}>
      {children}

      {/* Toast Container - Bottom Right */}
      <div className="fixed bottom-24 right-6 z-[9999] flex flex-col-reverse gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={dismissToast} />
          </div>
        ))}
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
