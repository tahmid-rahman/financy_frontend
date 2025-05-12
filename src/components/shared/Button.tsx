import { ReactNode } from "react";
import { motion } from "framer-motion";

interface ButtonProps {
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

export const Button = ({
  children,
  type = "button",
  onClick,
  className = "",
  isLoading = false,
  disabled = false,
}: ButtonProps) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      disabled={disabled || isLoading}
      className={`relative px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${className} ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-md"
      }`}
    >
      {isLoading ? (
        <div className="flex justify-center items-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing...
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
};
