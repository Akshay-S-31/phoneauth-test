import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const { user, token, backendUser, logout, loading, validateWithBackend } =
    useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  // Validate token on mount if not yet validated
  useEffect(() => {
    if (user && token && !backendUser) {
      validateWithBackend(token);
    }
  }, [user, token, backendUser, validateWithBackend]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const getTokenExpiry = () => {
    if (backendUser?.expTime) {
      const expDate = new Date(backendUser.expTime);
      const now = new Date();
      const diff = expDate - now;
      if (diff <= 0) return "Expired";
      const mins = Math.floor(diff / 60000);
      return `${mins} min remaining`;
    }
    return "—";
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-screen">
          <div className="spinner large"></div>
          <p>Loading your session...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="card-glow"></div>

        <div className="dashboard-header">
          <div className="avatar">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="4" fill="url(#avatarGrad)" />
              <path
                d="M4 20c0-4 4-7 8-7s8 3 8 7"
                stroke="url(#avatarGrad)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="avatarGrad" x1="4" y1="4" x2="20" y2="20">
                  <stop stopColor="#ff1744" />
                  <stop offset="1" stopColor="#dc143c" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1>Welcome!</h1>
          <p className="subtitle">You're securely authenticated</p>
        </div>

        <div className="info-grid">
          <div className="info-card">
            <div className="info-icon phone-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                />
              </svg>
            </div>
            <div className="info-content">
              <span className="info-label">Phone Number</span>
              <span className="info-value">
                {user.phoneNumber || "Not available"}
              </span>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon uid-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                />
              </svg>
            </div>
            <div className="info-content">
              <span className="info-label">User ID</span>
              <span className="info-value uid-text">{user.uid}</span>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon token-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="info-content">
              <span className="info-label">Token Expiry</span>
              <span className="info-value">{getTokenExpiry()}</span>
            </div>
          </div>

          <div className="info-card">
            <div className={`info-icon status-icon ${backendUser ? "verified" : "pending"}`}>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor">
                {backendUser ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                )}
              </svg>
            </div>
            <div className="info-content">
              <span className="info-label">Backend Status</span>
              <span className={`info-value status-text ${backendUser ? "verified" : "pending"}`}>
                {backendUser ? "Verified ✓" : "Validating..."}
              </span>
            </div>
          </div>
        </div>

        <button className="btn-logout" onClick={handleLogout}>
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" width="20" height="20">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
            />
          </svg>
          Sign Out
        </button>
      </div>

      {/* Background decoration */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>
      <div className="bg-orb bg-orb-3"></div>
    </div>
  );
};

export default DashboardPage;
