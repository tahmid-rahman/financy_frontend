import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect, useRef } from "react";
import Button from "../ui/Button";
import { XMarkIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { useToast } from "../../contexts/ToastContext";

// Use environment variable for API URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

type ForgotPasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string, resetToken: string) => void;
};

type Step = "email" | "otp" | "reset";

export default function ForgotPasswordModal({ isOpen, onClose, onSuccess }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { showToast } = useToast();

  // Timer ref for cleanup
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Clear timer when modal closes
  useEffect(() => {
    if (!isOpen) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isOpen]);

  const handleSendOTP = async () => {
    if (!email) {
      showToast({ message: "Please enter your email", type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/forgot-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        // Backend now returns same message regardless of account existence (email enumeration prevention)
        showToast({ message: "If an account exists, we've sent an OTP.", type: "success" });
        setStep("otp");
        // Start countdown for resend
        setCountdown(60);
        // Clear any existing timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        timerRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else if (response.status === 429) {
        showToast({ message: data.message || "Too many requests. Please try again later.", type: "error" });
      } else {
        showToast({ message: data.message || "Failed to send OTP", type: "error" });
      }
    } catch {
      showToast({ message: "Network error. Please try again.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      showToast({ message: "Please enter a 6-digit OTP", type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/verify-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok && data.data?.reset_token) {
        showToast({ message: "OTP verified!", type: "success" });
        setResetToken(data.data.reset_token);
        setStep("reset");
      } else {
        showToast({ message: data.message || "Invalid OTP", type: "error" });
      }
    } catch {
      showToast({ message: "Network error. Please try again.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      showToast({ message: "Password must be at least 8 characters", type: "error" });
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      showToast({ message: "Password must contain an uppercase letter", type: "error" });
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      showToast({ message: "Password must contain a lowercase letter", type: "error" });
      return;
    }

    if (!/\d/.test(newPassword)) {
      showToast({ message: "Password must contain a number", type: "error" });
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      showToast({ message: "Password must contain a special character", type: "error" });
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast({ message: "Passwords do not match", type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/reset-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset_token: resetToken, new_password: newPassword }),
      });

      const data = await response.json();

      if (response.ok && data.data?.token) {
        showToast({ message: "Password reset successful! Please login.", type: "success" });
        onSuccess(email, data.data.token);
        handleClose();
      } else {
        showToast({ message: data.message || "Failed to reset password", type: "error" });
      }
    } catch {
      showToast({ message: "Network error. Please try again.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setStep("email");
    setEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setResetToken("");
    setCountdown(0);
    onClose();
  };

  const handleResendOTP = () => {
    if (countdown === 0) {
      handleSendOTP();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-surface border border-border/50 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium text-text">
                    {step === "email" && "Reset Password"}
                    {step === "otp" && "Verify OTP"}
                    {step === "reset" && "New Password"}
                  </Dialog.Title>
                  <button onClick={handleClose} className="text-text-muted hover:text-text">
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Step 1: Enter Email */}
                {step === "email" && (
                  <div className="space-y-4">
                    <p className="text-sm text-text-muted">
                      Enter your email address and we'll send you an OTP to reset your password.
                    </p>
                    <div>
                      <label className="block text-sm text-text-muted mb-1">Email</label>
                      <div className="relative">
                        <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-background text-text border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>
                    <Button onClick={handleSendOTP} isLoading={isLoading} className="w-full">
                      Send OTP
                    </Button>
                  </div>
                )}

                {/* Step 2: Enter OTP */}
                {step === "otp" && (
                  <div className="space-y-4">
                    <p className="text-sm text-text-muted">
                      Enter the 6-digit code sent to <span className="font-medium text-text">{email}</span>
                    </p>
                    <div>
                      <label className="block text-sm text-text-muted mb-1">OTP Code</label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="w-full px-4 py-2 bg-background text-text border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-center text-2xl tracking-widest font-mono"
                        placeholder="000000"
                        maxLength={6}
                      />
                    </div>
                    <Button onClick={handleVerifyOTP} isLoading={isLoading} className="w-full">
                      Verify OTP
                    </Button>
                    <div className="text-center">
                      {countdown > 0 ? (
                        <p className="text-xs text-text-muted">Resend OTP in {countdown}s</p>
                      ) : (
                        <button onClick={handleResendOTP} className="text-xs text-primary hover:underline">
                          Resend OTP
                        </button>
                      )}
                    </div>
                    <div className="text-center">
                      <button onClick={() => setStep("email")} className="text-xs text-text-muted hover:text-text">
                        Change email address
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Set New Password */}
                {step === "reset" && (
                  <div className="space-y-4">
                    <p className="text-sm text-text-muted">
                      Create a new password for your account.
                    </p>
                    <div>
                      <label className="block text-sm text-text-muted mb-1">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 bg-background text-text border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                        placeholder="Min. 6 characters"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-text-muted mb-1">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 bg-background text-text border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                        placeholder="Confirm password"
                      />
                    </div>
                    <Button onClick={handleResetPassword} isLoading={isLoading} className="w-full">
                      Reset Password
                    </Button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}