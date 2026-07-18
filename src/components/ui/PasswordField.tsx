import { ExclamationCircleIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

type PasswordFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  showPassword: boolean;
  toggleShowPassword: () => void;
};

export function PasswordField({ label, value, onChange, error, showPassword, toggleShowPassword }: PasswordFieldProps) {
  return (
    <div>
      <label className="block text-sm text-text-muted mb-1">{label}</label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full text-text px-4 py-2 bg-background border ${
            error ? "border-accent" : "border-border/50"
          } rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none pr-10`}
        />
        <button
          type="button"
          onClick={toggleShowPassword}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text"
        >
          {showPassword ? <EyeSlashIcon className="h-5 w-5 text-text" /> : <EyeIcon className="h-5 w-5" />}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-sm text-accent flex items-center gap-1">
          <ExclamationCircleIcon className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}
