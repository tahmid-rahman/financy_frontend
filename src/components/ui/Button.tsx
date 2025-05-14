import { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "ghostAccent" | "accent" | "delete";
  disabled?: boolean;
  loading?: boolean;
  size?: "sm" | "md";
  className?: string;
  onClick?: () => void;
};

export default function Button({ children, variant = "primary", size = "md", className = "", ...props }: ButtonProps) {
  const baseStyles = "rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
  };

  const variantStyles = {
    primary: "bg-primary text-surface hover:bg-primary-dark",
    secondary: "bg-surface border border-border hover:bg-background",
    ghost: "text-primary hover:bg-primary/10",
    accent: "bg-accent hover:bg-accent-dark text-white",
    ghostAccent: "text-accent hover:bg-accent/10",
    delete: "bg-red-500 hover:bg-red-600 text-white",
  };

  return (
    <button className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
