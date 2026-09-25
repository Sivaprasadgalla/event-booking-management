"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => string;
  removeToast: (id: string) => void;
  toast: {
    success: (message: string, title?: string, duration?: number) => string;
    error: (message: string, title?: string, duration?: number) => string;
    warning: (message: string, title?: string, duration?: number) => string;
    info: (message: string, title?: string, duration?: number) => string;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type, message, title, duration = 4000 }: Omit<ToastItem, "id">) => {
      const id = Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, message, title, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const toast = {
    success: useCallback(
      (message: string, title?: string, duration?: number) =>
        addToast({ type: "success", message, title: title || "Success", duration }),
      [addToast]
    ),
    error: useCallback(
      (message: string, title?: string, duration?: number) =>
        addToast({ type: "error", message, title: title || "Error", duration }),
      [addToast]
    ),
    warning: useCallback(
      (message: string, title?: string, duration?: number) =>
        addToast({ type: "warning", message, title: title || "Attention", duration }),
      [addToast]
    ),
    info: useCallback(
      (message: string, title?: string, duration?: number) =>
        addToast({ type: "info", message, title: title || "Notice", duration }),
      [addToast]
    ),
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      aria-live="assertive"
      id="celebratehub-toast-portal"
      className="fixed top-5 right-4 sm:right-6 left-4 sm:left-auto sm:w-[420px] max-w-full flex flex-col gap-3 pointer-events-none"
      style={{ zIndex: 99999999 }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}

const ToastCard = React.forwardRef<
  HTMLDivElement,
  {
    toast: ToastItem;
    onDismiss: () => void;
  }
>(({ toast, onDismiss }, ref) => {
  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";
  const isWarning = toast.type === "warning";
  const isInfo = toast.type === "info";

  const bgBorderColor = isSuccess
    ? "bg-slate-900/95 border-emerald-500/40 text-slate-100 shadow-emerald-950/40"
    : isError
    ? "bg-slate-900/95 border-rose-500/40 text-slate-100 shadow-rose-950/40"
    : isWarning
    ? "bg-slate-900/95 border-amber-500/40 text-slate-100 shadow-amber-950/40"
    : "bg-slate-900/95 border-purple-500/40 text-slate-100 shadow-purple-950/40";

  const progressColor = isSuccess
    ? "bg-emerald-400/80"
    : isError
    ? "bg-rose-400/80"
    : isWarning
    ? "bg-amber-400/80"
    : "bg-purple-400/80";

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: -16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, y: -10, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 450, damping: 30 }}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl p-4 shadow-2xl backdrop-blur-2xl border transition-colors ${bgBorderColor}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="shrink-0 mt-0.5">
          {isSuccess && (
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}
          {isError && (
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}
          {isWarning && (
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          )}
          {isInfo && (
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Info className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-2">
          {toast.title && (
            <p className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-0.5">
              {toast.title}
            </p>
          )}
          <p className="text-xs sm:text-sm font-medium text-slate-100 leading-snug break-words">
            {toast.message}
          </p>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={onDismiss}
          className="shrink-0 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Animated timer bar at bottom */}
      {toast.duration && toast.duration > 0 && (
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: toast.duration / 1000, ease: "linear" }}
          className={`absolute bottom-0 left-0 h-0.5 ${progressColor}`}
        />
      )}
    </motion.div>
  );
});

ToastCard.displayName = "ToastCard";
