import { useEffect, useState, useRef, useCallback } from "react";
import { Transition } from "@headlessui/react";
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XMarkIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";

export type ToastType = "success" | "error" | "info" | "warning";

export type ToastItem = {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
};

type ToastProps = {
  toast: ToastItem;
  onClose: (id: string) => void;
};

const icons = {
  success: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
  error: <ExclamationCircleIcon className="h-5 w-5 text-red-500" />,
  warning: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />,
  info: <InformationCircleIcon className="h-5 w-5 text-blue-500" />,
};

const darkStyles = {
  success: {
    bg: "dark:bg-green-900/80",
    border: "dark:border-green-700",
    progress: "bg-green-500",
    text: "text-green-800 dark:text-green-100",
  },
  error: {
    bg: "dark:bg-red-900/80",
    border: "dark:border-red-700",
    progress: "bg-red-500",
    text: "text-red-800 dark:text-red-100",
  },
  warning: {
    bg: "dark:bg-yellow-900/80",
    border: "dark:border-yellow-700",
    progress: "bg-yellow-500",
    text: "text-yellow-800 dark:text-yellow-100",
  },
  info: {
    bg: "dark:bg-blue-900/80",
    border: "dark:border-blue-700",
    progress: "bg-blue-500",
    text: "text-blue-800 dark:text-blue-100",
  },
};

function Toast({ toast, onClose }: ToastProps) {
  const { id, message, type, duration = 4000 } = toast;
  const [show, setShow] = useState(true);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const progressRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(duration);

  const styles = darkStyles[type];

  const clearTimer = useCallback(() => {
    if (progressRef.current) {
      clearInterval(progressRef.current);
    }
  }, []);

  const updateProgress = useCallback(() => {
    if (isPaused) return;

    const elapsed = Date.now() - startTimeRef.current;
    const remaining = remainingTimeRef.current - elapsed;
    const newProgress = (remaining / duration) * 100;
    setProgress(Math.max(0, newProgress));

    if (remaining <= 0) {
      clearTimer();
      setShow(false);
      setTimeout(() => onClose(id), 200);
    }
  }, [duration, id, onClose, isPaused, clearTimer]);

  useEffect(() => {
    if (isPaused) {
      clearTimer();
      return;
    }

    startTimeRef.current = Date.now();
    progressRef.current = setInterval(updateProgress, 50);

    return clearTimer;
  }, [isPaused, updateProgress, clearTimer]);

  const handlePause = () => {
    remainingTimeRef.current = (progress / 100) * duration;
    setIsPaused(true);
  };

  const handleResume = () => {
    startTimeRef.current = Date.now();
    setIsPaused(false);
  };

  const handleClose = () => {
    clearTimer();
    setShow(false);
    setTimeout(() => onClose(id), 200);
  };

  return (
    <Transition
      show={show}
      appear={true}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 scale-95"
      enterTo="translate-y-0 opacity-100 scale-100"
      leave="transition ease-in duration-200"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-95"
    >
      <div
        className={`pointer-events-auto relative w-full max-w-sm rounded-lg shadow-lg overflow-hidden border ${styles.bg} ${styles.border} bg-white`}
        onMouseEnter={handlePause}
        onMouseLeave={handleResume}
      >
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
          <div
            className={`h-full ${styles.progress} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">{icons[type]}</div>
            <div className={`flex-1 text-sm font-medium ${styles.text}`}>
              {message}
            </div>
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <XMarkIcon className={`h-4 w-4 ${styles.text} opacity-60 hover:opacity-100`} />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  );
}

// Toast Container to manage multiple toasts
export function ToastContainer({ toasts, onClose }: { toasts: ToastItem[]; onClose: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}