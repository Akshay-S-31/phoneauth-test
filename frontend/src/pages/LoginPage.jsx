import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

const LoginPage = () => {
  const { sendOtp, verifyOtp, user, isFirebaseConfigured } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState("phone"); // "phone" | "otp"
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const otpRefs = useRef([]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  // Resend countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!phone || phone.length < 8) {
      setError("Please enter a valid phone number with country code.");
      return;
    }

    setLoading(true);
    try {
      await sendOtp(phone);
      setStep("otp");
      setResendTimer(30);
    } catch (err) {
      console.error("Send OTP error:", err);
      if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else if (err.code === "auth/invalid-phone-number") {
        setError("Please enter a valid phone number with country code.");
      } else if (err.code === "auth/captcha-check-failed") {
        setError("Bot verification failed. Please try again.");
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(otpCode);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Verify OTP error:", err);
      if (err.code === "auth/invalid-verification-code") {
        setError("The code you entered is incorrect. Please try again.");
      } else if (err.code === "auth/code-expired") {
        setError("This code has expired. Please request a new one.");
      } else {
        setError("Verification failed. Please try again.");
      }
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError("");
    setOtp(["", "", "", "", "", ""]);
    setLoading(true);
    try {
      // Reset recaptcha for resend
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      await sendOtp(phone);
      setResendTimer(30);
    } catch (err) {
      setError("Failed to resend code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Decorative elements */}
        <div className="card-glow"></div>
        <div className="card-shimmer"></div>

        {!isFirebaseConfigured && (
          <div className="config-warning">
            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <strong>Firebase not configured.</strong>
              <span> Copy <code>.env.example</code> to <code>.env</code> and add your Firebase credentials.</span>
            </div>
          </div>
        )}

        <div className="login-header">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                fill="url(#grad1)"
                opacity="0.2"
              />
              <path
                d="M16.5 10.5c0-1.38-.56-2.63-1.46-3.54A4.98 4.98 0 0011.5 5.5c-2.76 0-5 2.24-5 5 0 1.38.56 2.63 1.46 3.54a4.98 4.98 0 003.54 1.46"
                stroke="url(#grad2)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M15 12l-3 3m0 0l-3-3m3 3V8"
                stroke="url(#grad2)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                transform="rotate(180 12 12.5)"
              />
              <defs>
                <linearGradient id="grad1" x1="2" y1="2" x2="22" y2="22">
                  <stop stopColor="#dc143c" />
                  <stop offset="1" stopColor="#b71c1c" />
                </linearGradient>
                <linearGradient id="grad2" x1="6" y1="5" x2="18" y2="17">
                  <stop stopColor="#ff1744" />
                  <stop offset="1" stopColor="#dc143c" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1>Welcome Back</h1>
          <p className="subtitle">
            {step === "phone"
              ? "Sign in with your phone number"
              : `Enter the code sent to ${phone}`}
          </p>
        </div>

        {error && (
          <div className="error-message">
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="login-form">
            <div className="input-group">
              <label htmlFor="phone-input">Phone Number</label>
              <PhoneInput
                id="phone-input"
                international
                defaultCountry="IN"
                value={phone}
                onChange={setPhone}
                className="phone-input"
                placeholder="Enter phone number"
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !phone}
            >
              {loading ? (
                <span className="spinner-wrapper">
                  <span className="spinner"></span>
                  Sending...
                </span>
              ) : (
                "Send OTP"
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="login-form">
            <div className="input-group">
              <label>Verification Code</label>
              <div className="otp-inputs" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="otp-input"
                    autoFocus={i === 0}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || otp.join("").length !== 6}
            >
              {loading ? (
                <span className="spinner-wrapper">
                  <span className="spinner"></span>
                  Verifying...
                </span>
              ) : (
                "Verify Code"
              )}
            </button>

            <div className="resend-section">
              {resendTimer > 0 ? (
                <p className="resend-timer">
                  Didn't receive a code? Resend after{" "}
                  <span className="timer-count">{resendTimer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  className="btn-link"
                  onClick={handleResend}
                  disabled={loading}
                >
                  Resend Code
                </button>
              )}
            </div>

            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setStep("phone");
                setOtp(["", "", "", "", "", ""]);
                setError("");
              }}
            >
              ← Change Phone Number
            </button>
          </form>
        )}

        <div id="recaptcha-container"></div>
      </div>

      {/* Background decoration */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>
      <div className="bg-orb bg-orb-3"></div>
    </div>
  );
};

export default LoginPage;
