import { forwardRef } from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(({ label, error, ...props }, ref) => (
  <div className="mb-4">
    <label className="block text-text text-sm font-medium mb-2">{label}</label>
    <input
      ref={ref}
      className={`w-full px-4 py-3 rounded-lg border ${
        error ? "border-red-500" : "border-border"
      } focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
));
