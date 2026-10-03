"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/src/components/Navbar";
import {
  signinWithGoogle,
  getAuthErrorMessage,
} from "@/src/config/providers";
import OtpVerification from "@/src/components/Otpverification";
import { sendOtp, verifyOtp } from "@/src/store/apistore";

interface AuthErrorLike {
  code?: string;
  message?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showOtp, setShowOtp] = useState(false);

  // Calculate password strength
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: "Weak", color: "bg-red-500" };
      case 2:
        return { score: 50, label: "Fair", color: "bg-amber-500" };
      case 3:
        return { score: 75, label: "Good", color: "bg-blue-500" };
      case 4:
        return { score: 100, label: "Strong", color: "bg-emerald-500" };
      default:
        return { score: 0, label: "", color: "" };
    }
  };

  const strength = getPasswordStrength();

  const handleGoogleSignUp = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setGoogleLoading(true);
    try {
      const user = await signinWithGoogle();
      setSuccessMessage(
        `Welcome to Open To Work, ${user.displayName || user.email || "User"}!`
      );
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err: unknown) {
      const authErr = err as AuthErrorLike;
      if (authErr?.code !== "auth/popup-closed-by-user") {
        setErrorMessage(getAuthErrorMessage(authErr));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // 1. Take username, email, and password from the fields
    const username = fullName.trim();
    const userEmail = email.trim();
    const userPassword = password.trim();

    if (!username || !userEmail || !userPassword) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    // 3. Email must be valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    // 2. Password must be >= 6 characters
    if (userPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (userPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    // 4. Pass all fields in sendOtp function
    setLoading(true);
    try {
      await sendOtp(username, userEmail, userPassword);
      // 5. After coming success message from sendOtp then show OtpVerification Component
      setSuccessMessage("A 6-digit verification code has been sent to your email.");
      setShowOtp(true);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setErrorMessage(
        errorObj?.message || "Failed to send verification code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // 6. Take 6 digit otp from the user and call verify function
  const handleVerifyOtp = async (otpCode: string) => {
    setErrorMessage("");
    setSuccessMessage("");
    await verifyOtp(email.trim(), otpCode);

    // 7. After getting success redirect user to login page
    setSuccessMessage("Registration successful! Redirecting to login page...");
    setTimeout(() => {
      router.push("/login");
    }, 1500);
  };

  const handleResendOtp = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    await sendOtp(fullName.trim(), email.trim(), password.trim());
    setSuccessMessage("A fresh verification code has been sent to your email.");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        {showOtp ? (
          <OtpVerification
            email={email}
            onVerify={handleVerifyOtp}
            onResend={handleResendOtp}
            onBack={() => {
              setShowOtp(false);
              setErrorMessage("");
              setSuccessMessage("");
            }}
            error={errorMessage}
            successMessage={successMessage}
          />
        ) : (
          <div className="w-full max-w-[500px]">

            {/* Card Container */}
            <div className="bg-white rounded-3xl !p-6 sm:!p-5 border border-[#E5DDD0] shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-all">

              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 text-[#EA580C] mb-3 shadow-xs">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1917] font-[family-name:var(--font-playfair)]">
                  Create an account
                </h1>
                <p className="mt-1.5 text-sm text-stone-500 font-[family-name:var(--font-jakarta)]">
                  Start your journey with Open To Work today.
                </p>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200/80 flex items-start gap-2.5 text-red-700 text-sm animate-in fade-in duration-200">
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
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Success Alert */}
              {successMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-2.5 text-emerald-800 text-sm animate-in fade-in duration-200">
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
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Google Sign-Up Button */}
              <button
                type="button"
                id="google-signup-btn"
                onClick={handleGoogleSignUp}
                disabled={googleLoading || loading}
                className="!w-full !flex !items-center !justify-center !gap-3 !py-3 !px-4 !rounded-xl !border !border-[#E5DDD0] !bg-white hover:!bg-[#FAF7F2] !text-[#1C1917] !font-medium !text-sm transition-all duration-200 !shadow-xs hover:!shadow active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {googleLoading ? (
                  <svg
                    className="w-5 h-5 animate-spin text-stone-600"
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
                ) : (
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span className="font-semibold text-stone-800">
                  {googleLoading ? "Connecting to Google..." : "Sign up with Google"}
                </span>
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E5DDD0]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-stone-400 font-medium tracking-wider">
                    or register with email
                  </span>
                </div>
              </div>

              {/* Signup Form */}
              <form onSubmit={handleSubmit} className="!w-full space-y-4">
                {/* Full Name */}
                <div className="w-full">
                  <label
                    htmlFor="fullName"
                    className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5"
                  >
                    Full Name
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400 z-10">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Alex Morgan"
                      autoComplete="name"
                      className="!w-full !pl-10 !pr-4 !py-2.5 !rounded-xl !border !border-[#E5DDD0] !bg-[#FAF7F2]/40 !text-[#1C1917] placeholder:!text-stone-400 !text-sm focus:!outline-none focus:!border-[#EA580C] focus:!bg-white focus:!ring-3 focus:!ring-orange-500/15 transition-all"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className="w-full">
                  <label
                    htmlFor="signup-email"
                    className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5"
                  >
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400 z-10">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                        />
                      </svg>
                    </div>
                    <input
                      id="signup-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      autoComplete="email"
                      className="!w-full !pl-10 !pr-4 !py-2.5 !rounded-xl !border !border-[#E5DDD0] !bg-[#FAF7F2]/40 !text-[#1C1917] placeholder:!text-stone-400 !text-sm focus:!outline-none focus:!border-[#EA580C] focus:!bg-white focus:!ring-3 focus:!ring-orange-500/15 transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="w-full">
                  <label
                    htmlFor="signup-password"
                    className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400 z-10">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                      className="!w-full !pl-10 !pr-10 !py-2.5 !rounded-xl !border !border-[#E5DDD0] !bg-[#FAF7F2]/40 !text-[#1C1917] placeholder:!text-stone-400 !text-sm focus:!outline-none focus:!border-[#EA580C] focus:!bg-white focus:!ring-3 focus:!ring-orange-500/15 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="!bg-transparent !border-0 !p-1.5 !shadow-none absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center !text-stone-400 hover:!text-stone-700 transition-colors cursor-pointer"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {password.length > 0 && (
                    <div className="mt-2 space-y-1 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between text-[11px] text-stone-500">
                        <span>Strength</span>
                        <span className="font-medium text-stone-700">{strength.label}</span>
                      </div>
                      <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${strength.color} transition-all duration-300`}
                          style={{ width: `${strength.score}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div className="w-full">
                  <label
                    htmlFor="confirm-password"
                    className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5"
                  >
                    Confirm Password
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400 z-10">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                      className="!w-full !pl-10 !pr-10 !py-2.5 !rounded-xl !border !border-[#E5DDD0] !bg-[#FAF7F2]/40 !text-[#1C1917] placeholder:!text-stone-400 !text-sm focus:!outline-none focus:!border-[#EA580C] focus:!bg-white focus:!ring-3 focus:!ring-orange-500/15 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="!bg-transparent !border-0 !p-1.5 !shadow-none absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center !text-stone-400 hover:!text-stone-700 transition-colors cursor-pointer"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  id="signup-submit-btn"
                  disabled={loading || googleLoading}
                  className="!w-full !flex !items-center !justify-center !gap-2 !py-3 !px-4 !rounded-xl !bg-[#1e2329] hover:!bg-slate-900 !text-white !font-semibold !text-sm !shadow-md hover:!shadow-lg active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
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
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>
              </form>

              {/* Footer / Switch to Login */}
              <div className="mt-8 text-center pt-5 border-t border-[#E5DDD0]">
                <p className="text-xs sm:text-sm text-stone-600 font-[family-name:var(--font-jakarta)]">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-bold text-[#EA580C] hover:text-[#C2410C] hover:underline transition-colors"
                  >
                    Log in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
