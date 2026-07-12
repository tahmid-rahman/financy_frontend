import { useEffect, useState, useRef } from "react";
import { Transition } from "@headlessui/react";
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";

type ToastProps = {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
};

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  const [show, setShow] = useState(true);
  const [progress, setProgress] = useState(100);
  const progressRef = useRef<NodeJS.Timeout>();
  const remainingTimeRef = useRef<number>(duration);

  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + remainingTimeRef.current;

    const updateProgress = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const newProgress = 100 - (elapsed / duration) * 100;
      setProgress(Math.max(0, Math.min(100, newProgress)));

      if (now >= endTime) {
        setShow(false);
        onClose();
      } else {
        progressRef.current = setTimeout(updateProgress, 50);
      }
    };

    progressRef.current = setTimeout(updateProgress, 50);

    return () => {
      if (progressRef.current) {
        clearTimeout(progressRef.current);
        const now = Date.now();
        remainingTimeRef.current = Math.max(0, endTime - now);
      }
    };
  }, [duration, onClose]);

  const toastConfig = {
    success: {
      bgColor: "bg-surface",
      textColor: "text-text",
      borderColor: "border-green-200",
      progressColor: "bg-primary",
      icon: <CheckCircleIcon className="h-5 w-5 text-green-400" />,
    },
    error: {
      bgColor: "bg-red-50",
      textColor: "text-red-800",
      borderColor: "border-red-200",
      progressColor: "bg-red-400",
      icon: <ExclamationCircleIcon className="h-5 w-5 text-red-400" />,
    },
    info: {
      bgColor: "bg-blue-50",
      textColor: "text-blue-800",
      borderColor: "border-blue-200",
      progressColor: "bg-blue-400",
      icon: <InformationCircleIcon className="h-5 w-5 text-blue-400" />,
    },
  }[type];

  const handleClose = () => {
    setShow(false);
    if (progressRef.current) {
      clearTimeout(progressRef.current);
    }
    onClose();
  };

  return (
    <Transition
      show={show}
      appear={true}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed top-4 right-4 max-w-sm w-full shadow-lg rounded-lg pointer-events-auto overflow-hidden z-50 bg-surface text-text">
        <div className={`relative border rounded-lg ${toastConfig.bgColor} ${toastConfig.borderColor}`}>
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-opacity-30 bg-gray-200 overflow-hidden">
            <div
              className={`h-full ${toastConfig.progressColor}`}
              style={{ width: `${progress}%`, transition: "width 50ms linear" }}
            />
          </div>

          <div className="p-4 pt-5">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">{toastConfig.icon}</div>
              <div className={`ml-3 w-0 flex-1 pt-0.5 ${toastConfig.textColor}`}>
                <p className="text-sm font-medium">{message}</p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  onClick={handleClose}
                  className={`inline-flex rounded-md ${toastConfig.bgColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${type}-500`}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className={`h-5 w-5 ${toastConfig.textColor}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
}
