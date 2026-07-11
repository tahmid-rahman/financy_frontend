import { createContext, useContext, useState } from "react";
import { Toast } from "../components/ui/Toast";

type ToastType = {
  message: string;
  type: "success" | "error" | "info";
};

type ToastContextType = {
  showToast: (toast: ToastType) => void;
};

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastType | null>(null);

  const showToast = ({ message, type }: ToastType) => {
    setToast({ message, type });
  };

  const handleClose = () => {
    setToast(null);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <Toast message={toast.message} type={toast.type} onClose={handleClose} />}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
