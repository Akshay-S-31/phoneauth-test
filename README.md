# PhoneAuth — Firebase Phone Authentication App

A test project built to explore and demonstrate **Firebase Phone Authentication** with OTP verification.

## What This Is

This was built as a hands-on test of Firebase's phone-based auth flow — sending OTPs, verifying them, extracting ID tokens, and validating sessions. Not a production app, just a working proof-of-concept.

## Tech Stack

- **Frontend**: React (Vite) + Firebase Auth SDK
- **Backend**: Express.js + Firebase Admin SDK (token verification)
- **Styling**: Custom CSS — dark theme with crimson accents

## Setup

1. Clone the repo
2. Copy `.env.example` → `.env` in both `frontend/` and `backend/`
3. Fill in your Firebase credentials
4. `cd frontend && npm install && npm run dev`
5. `cd backend && npm install && npm run dev`

## Notes

- Firebase Phone Auth requires the **Blaze (pay-as-you-go)** plan to send real SMS
- For free testing, use **test phone numbers** in Firebase Console → Authentication → Sign-in method → Phone
- The backend is optional — the core OTP flow works entirely client-side via Firebase
