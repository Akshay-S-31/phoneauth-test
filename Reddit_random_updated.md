# **Project Requirements Plan (PRP)**

**Project Title:** Firebase Phone Authentication & Identity Management App

**Platform:** React Vite (Web)

---

## **1. Project Overview**

A fast, lightweight full-stack application designed to authenticate users via their phone numbers. The system integrates Firebase Authentication to handle OTP (One-Time Password) dispatch and verification. Upon successful authentication, the system securely extracts the user's ID Token and passes it to a lightweight backend for validation, enabling secure access to protected resources. The client maintains session persistence for a seamless experience across reloads.

---

## **2. Target Audience & Use Case**

* **Target Audience:** End-users accessing the platform who prefer or require a passwordless login mechanism (e.g., mobile-first users, older demographics, or high-friction onboarding environments).
* **Primary Use Case:** Providing a seamless, high-conversion login flow that minimizes drop-off rates by eliminating the need to create and remember passwords.

---

## **3. Core Requirements**

### **3.1. Functional Requirements**

* **Phone Number Input:** A form field accepting internationalized phone number formats (e.g., +1 234 567 8900), validated using the `react-phone-number-input` library backed by `libphonenumber-js`.
* **Bot Protection:** Invisible reCAPTCHA verification to prevent automated abuse and comply with Firebase security standards.
* **OTP Dispatch:** Generation and dispatch of a 6-digit OTP via SMS upon valid phone number submission.
* **OTP Verification:** A secondary input field to collect and submit the 6-digit OTP to Firebase for validation.
* **Token Extraction:** Upon successful verification, the app requests the User ID Token from the Firebase Authentication payload.
* **Backend Token Validation:** The ID Token is sent to a lightweight Express.js backend endpoint, which verifies it using the Firebase Admin SDK before granting access to protected resources. This ensures the token is never blindly trusted on the client alone.
* **Session Persistence:** Persistent client-side storage of the ID Token using `localStorage` for convenience, with an acknowledged tradeoff against XSS risk (acceptable for this project scope; production hardening would use HttpOnly cookies).
* **Authenticated Dashboard:** On successful login, the user is presented with a basic profile dashboard displaying their phone number, UID, and token expiry.
* **Logout Mechanism:** A function to call Firebase `signOut()`, clear the stored token, and reset the application state.

### **3.2. Non-Functional Requirements**

* **Performance:** Highly responsive UI leveraging Vite's fast HMR and optimized build pipeline.
* **Usability:** Clear, user-friendly error handling across all failure states — invalid phone format, incorrect OTP, network errors, and token expiry.
* **Security:** Raw OTPs are never stored. Firebase project configuration restricts authorized domains to prevent unauthorized API key usage. Token validation is enforced server-side.
* **Scalability:** Backend is structured with separation of concerns (routes, middleware, controllers) to allow easy extension.

---

## **4. Technology Stack**

| Layer | Technology |
|---|---|
| Frontend Framework | React.js (Vite) |
| Phone Input & Validation | `react-phone-number-input`, `libphonenumber-js` |
| Authentication Service | Firebase Authentication (Phone Auth provider) |
| Backend | Node.js + Express.js |
| Token Verification | Firebase Admin SDK (server-side) |
| State Management | React Hooks (`useState`, `useEffect`, `useContext`) |
| Storage | `localStorage` (Web) |
| Deployment | Firebase Hosting (frontend) + Render/Railway (backend) |

---

## **5. User Journey / Flow**

1. **Initial State:** The user opens the application and is presented with a login screen featuring an internationalized phone number input.
2. **Request OTP:** The user enters their phone number and taps "Send OTP". The app validates the format and triggers the invisible reCAPTCHA in the background.
3. **OTP Dispatch:** Firebase sends a 6-digit OTP via SMS to the provided number.
4. **Verification State:** The UI transitions to an OTP entry screen. The user inputs the received code.
5. **Token Generation:** Firebase verifies the code and returns a signed ID Token.
6. **Backend Validation:** The frontend sends the ID Token to the Express backend, which verifies it via Firebase Admin SDK and returns a success response.
7. **Session Storage:** The verified token is stored in `localStorage` and the app state is updated to reflect authenticated status.
8. **Authenticated Dashboard:** The user is redirected to a profile view showing their UID, phone number, and session info. The token is attached as a Bearer header for any subsequent API calls.
9. **Logout:** The user can sign out, which clears the token and returns them to the login screen.

---

## **6. Error Handling**

| Scenario | User-Facing Message |
|---|---|
| Invalid phone number format | "Please enter a valid phone number with country code." |
| reCAPTCHA failure | "Bot verification failed. Please try again." |
| OTP not received | "Didn't receive a code? Resend after 30 seconds." |
| Incorrect OTP | "The code you entered is incorrect. Please try again." |
| Expired OTP | "This code has expired. Please request a new one." |
| Network error | "Connection failed. Please check your internet and retry." |
| Token validation failure (backend) | "Session verification failed. Please log in again." |

---

## **7. Testing Approach**

* **Manual Testing:** All user journey steps will be tested end-to-end in a browser with a real phone number.
* **Firebase Emulator:** The Firebase Auth emulator will be used during development to avoid SMS charges and rate limits.
* **Unit Tests:** Core utility functions (phone validation, token parsing) will be tested using Vitest.
* **Backend Tests:** API endpoint for token verification will be tested using Thunder Client / Postman.

---

## **8. Security Considerations**

* Firebase API keys are restricted to authorized domains only.
* The Firebase Admin SDK private key is stored as an environment variable and never committed to version control.
* Raw OTPs are never logged or stored at any layer.
* Token expiry is respected — expired tokens trigger a re-authentication flow.
* `.env` files are listed in `.gitignore`.

---

## **9. Deployment Plan**

* **Frontend:** Deployed to Firebase Hosting via `firebase deploy`.
* **Backend:** Deployed to Render (free tier) as a Node.js web service.
* **Environment Variables:** Managed via platform dashboards (no secrets in code).
