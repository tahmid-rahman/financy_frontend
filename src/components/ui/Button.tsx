import { ReactNode } from "react";
import { Spinner } from "./Spinner";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "ghostAccent" | "accent" | "delete";
  disabled?: boolean;
  isLoading?: boolean;
  size?: "sm" | "md";
  className?: string;
  onClick?: () => void;
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  isLoading = false,
  ...props
}: ButtonProps) {
  const baseStyles = "rounded-md font-medium transition-colors focus:outline-none focus:ring-2 ";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
  };

  const variantStyles = {
    primary: "bg-primary text-surface hover:bg-primary-dark focus:ring-primary/50",
    secondary: "bg-surface border border-border hover:bg-background focus:ring-white/50",
    ghost: "text-primary border border-border hover:bg-primary/10 focus:ring-primary/50",
    accent: "bg-accent text-surface hover:bg-accent-dark focus:ring-accent/50",  
    ghostAccent: "text-accent border border-border hover:bg-accent/10 focus:ring-accent/50", 
    delete: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500/50",
  };

  return (
    <button className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`} {...props}>
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <Spinner className="" />
          Processing...
        </span>
      ) : (
        <span>{children}</span>
      )}
    </button>
  );
}
