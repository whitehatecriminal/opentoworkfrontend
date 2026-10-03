"use client";

import { useState, useRef, useEffect } from "react";

/**
 * OtpVerification Component
 *
 * @param {Object} props
 * @param {Function} props.onVerify - Dynamic callback function called with the 6-digit OTP code: onVerify(otp)
 * @param {Function} [props.onResend] - Optional callback function to resend OTP
 * @param {string} [props.email] - Email address to display where OTP was sent
 * @param {number} [props.length=6] - Number of OTP digits (default 6)
 * @param {boolean} [props.loading] - Optional external loading state
 * @param {string} [props.error] - Optional external error message
 * @param {string} [props.successMessage] - Optional external success message
 * @param {Function} [props.onBack] - Optional callback to go back / change email
 * @param {boolean} [props.autoSubmit=true] - Auto-submit when all digits are entered
 */
export default function OtpVerification({
  onVerify,
  onResend,
  email = "",
  length = 6,
  loading: externalLoading,
  error: externalError,
  successMessage: externalSuccessMessage,
  onBack,
  autoSubmit = true,
}) {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState("");
  const [internalSuccess, setInternalSuccess] = useState("");
  const [resendCooldown, setResendCooldown] = useState(60);
  const canResend = resendCooldown <= 0;

  const inputRefs = useRef([]);

  const isLoading = externalLoading !== undefined ? externalLoading : internalLoading;
  const displayError = externalError || internalError;
  const displaySuccess = externalSuccessMessage || internalSuccess;

  // Auto-focus the first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle single digit input
  const handleChange = (e, index) => {
    const value = e.target.value;
    if (internalError) setInternalError("");

    // Allow only numeric characters
    const numericChar = value.replace(/\D/g, "");

    if (!numericChar) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    // Take the last entered character if multiple characters are typed
    const singleDigit = numericChar.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = singleDigit;
    setOtp(newOtp);

    // Auto-focus next input
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if OTP is complete
    const fullOtp = newOtp.join("");
    if (fullOtp.length === length && autoSubmit) {
      triggerVerification(fullOtp);
    }
  };

  // Handle backspace, delete, and arrow keys
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // If current field is empty, delete previous field and move focus
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste full OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    const numericData = pastedData.replace(/\D/g, "").slice(0, length);

    if (!numericData) return;

    const newOtp = new Array(length).fill("");
    for (let i = 0; i < numericData.length; i++) {
      newOtp[i] = numericData[i];
    }
    setOtp(newOtp);

    // Focus last filled index or next empty index
    const nextIndex = Math.min(numericData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();

    if (numericData.length === length && autoSubmit) {
      triggerVerification(numericData);
    }
  };

  // Trigger verify callback (dynamic function provided via props)
  const triggerVerification = async (otpCode) => {
    const code = otpCode || otp.join("");
    if (code.length !== length) {
      setInternalError(`Please enter all ${length} digits.`);
      return;
    }

    if (typeof onVerify !== "function") {
      console.warn("OtpVerification: 'onVerify' prop function was not provided.");
      return;
    }

    setInternalError("");
    setInternalLoading(true);

    try {
      const result = await onVerify(code);
      if (result?.success) {
        setInternalSuccess("Verification successful!");
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Invalid OTP. Please try again.";
      setInternalError(errorMsg);
    } finally {
      setInternalLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    triggerVerification(otp.join(""));
  };

  // Handle resend OTP
  const handleResend = async () => {
    if (!canResend || isLoading) return;

    setInternalError("");
    setInternalSuccess("");
    setOtp(new Array(length).fill(""));
    setResendCooldown(60);
    setCanResend(false);

    if (typeof onResend === "function") {
      try {
        await onResend();
        setInternalSuccess("A new 6-digit code has been sent to your email.");
      } catch (err) {
        const errorMsg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to resend OTP. Please try again.";
        setInternalError(errorMsg);
      }
    } else {
      setInternalSuccess("OTP resent successfully.");
    }

    inputRefs.current[0]?.focus();
  };

  const isComplete = otp.every((digit) => digit !== "");

  return (
    <div className="w-full max-w-[480px] bg-white rounded-3xl border border-[#E5DDD0] p-6 sm:p-9 shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-all">
      {/* Icon & Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 text-[#EA580C] mb-3.5 shadow-xs">
          <svg
            className="w-7 h-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1917] font-[family-name:var(--font-playfair)]">
          Verify your email
        </h2>
        <p className="mt-2 text-sm text-stone-500 font-[family-name:var(--font-jakarta)] leading-relaxed">
          {email ? (
            <>
              We sent a 6-digit verification code to{" "}
              <span className="font-semibold text-stone-800 break-all">{email}</span>.
            </>
          ) : (
            "Please enter the 6-digit verification code sent to your email."
          )}
        </p>
      </div>

      {/* Error Alert */}
      {displayError && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200/80 flex items-start gap-2.5 text-red-700 text-sm animate-in fade-in duration-200">
          <svg
            className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="leading-snug">{displayError}</span>
        </div>
      )}

      {/* Success Alert */}
      {displaySuccess && (
        <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-2.5 text-emerald-800 text-sm animate-in fade-in duration-200">
          <svg
            className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="leading-snug">{displaySuccess}</span>
        </div>
      )}

      {/* OTP Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 6 Digit Input Boxes */}
        <div className="flex items-center justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              autoComplete="one-time-code"
              aria-label={`OTP digit ${index + 1} of ${length}`}
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              disabled={isLoading}
              className={`w-11 sm:w-14 h-13 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-2xl border transition-all duration-200 select-all outline-none ${
                digit
                  ? "border-[#EA580C] bg-white text-[#1C1917] shadow-xs ring-2 ring-orange-500/15"
                  : "border-[#E5DDD0] bg-[#FAF7F2]/60 text-stone-800 hover:border-stone-400 focus:border-[#EA580C] focus:bg-white focus:ring-3 focus:ring-orange-500/20"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            />
          ))}
        </div>

        {/* Verify Submit Button */}
        <button
          type="submit"
          id="otp-verify-btn"
          disabled={!isComplete || isLoading}
          className="!w-full !flex !items-center !justify-center !gap-2 !py-3.5 !px-4 !rounded-xl !bg-[#1e2329] hover:!bg-slate-900 !text-white !font-semibold !text-sm !shadow-md hover:!shadow-lg active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:!bg-[#1e2329]"
        >
          {isLoading ? (
            <>
              <svg
                className="w-4 h-4 animate-spin text-white"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              <span>Verifying code...</span>
            </>
          ) : (
            <span>Verify & Continue</span>
          )}
        </button>
      </form>

      {/* Resend OTP Section */}
      <div className="mt-7 text-center pt-5 border-t border-[#E5DDD0]">
        <p className="text-xs sm:text-sm text-stone-500 font-[family-name:var(--font-jakarta)]">
          Didn&apos;t receive the code?{" "}
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={isLoading}
              className="!bg-transparent !border-0 !p-0 !shadow-none font-bold text-[#EA580C] hover:text-[#C2410C] hover:underline cursor-pointer transition-colors"
            >
              Resend code
            </button>
          ) : (
            <span className="text-stone-400 font-medium">
              Resend in <span className="font-semibold text-stone-600">{resendCooldown}s</span>
            </span>
          )}
        </p>

        {/* Back / Change Email Option */}
        {onBack && (
          <div className="mt-3">
            <button
              type="button"
              onClick={onBack}
              disabled={isLoading}
              className="!bg-transparent !border-0 !p-0 !shadow-none text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>Use a different email address</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}