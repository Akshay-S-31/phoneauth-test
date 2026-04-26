import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  auth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  isFirebaseConfigured,
} from "../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("authToken"));
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [backendUser, setBackendUser] = useState(null);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // Listen for auth state changes
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const idToken = await firebaseUser.getIdToken();
        setToken(idToken);
        localStorage.setItem("authToken", idToken);
      } else {
        setUser(null);
        setToken(null);
        setBackendUser(null);
        localStorage.removeItem("authToken");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Set up invisible reCAPTCHA
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => {
          window.recaptchaVerifier = null;
        },
      });
    }
    return window.recaptchaVerifier;
  };

  // Send OTP
  const sendOtp = async (phoneNumber) => {
    if (!auth) throw new Error("Firebase is not configured. Check your .env file.");
    const appVerifier = setupRecaptcha();
    const confirmation = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      appVerifier
    );
    setConfirmationResult(confirmation);
    return confirmation;
  };

  // Verify OTP
  const verifyOtp = async (otpCode) => {
    if (!confirmationResult) {
      throw new Error("No confirmation result. Please request OTP first.");
    }
    const result = await confirmationResult.confirm(otpCode);
    const idToken = await result.user.getIdToken();
    setUser(result.user);
    setToken(idToken);
    localStorage.setItem("authToken", idToken);

    // Validate token with backend
    const backendResponse = await validateWithBackend(idToken);
    return backendResponse;
  };

  // Validate token with backend
  const validateWithBackend = useCallback(async (idToken) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/verify-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setBackendUser(data.user);
      }
      return data;
    } catch (error) {
      console.error("Backend validation failed:", error);
      return { success: false, message: "Connection failed. Please check your internet and retry." };
    }
  }, [BACKEND_URL]);

  // Logout
  const logout = async () => {
    if (auth) await signOut(auth);
    setUser(null);
    setToken(null);
    setBackendUser(null);
    setConfirmationResult(null);
    localStorage.removeItem("authToken");
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
  };

  const value = {
    user,
    token,
    loading,
    backendUser,
    isFirebaseConfigured,
    sendOtp,
    verifyOtp,
    logout,
    validateWithBackend,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
