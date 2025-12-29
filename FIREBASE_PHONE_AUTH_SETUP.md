# Firebase Phone Authentication Setup Guide

## Error: `auth/invalid-app-credential`

This error occurs when Firebase Phone Authentication is not properly configured. Follow these steps to fix it:

## Step 1: Enable Phone Authentication in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`hand-craft-store`)
3. Navigate to **Authentication** → **Sign-in method**
4. Find **Phone** in the list
5. Click on it and **Enable** it
6. Click **Save**

## Step 2: Configure reCAPTCHA (if required)

Firebase Phone Auth uses reCAPTCHA for verification. The code is set up to use invisible reCAPTCHA, which should work automatically.

If you still get errors:

1. In Firebase Console, go to **Authentication** → **Settings** → **reCAPTCHA**
2. Make sure reCAPTCHA is enabled
3. For testing, you can use the test phone numbers provided by Firebase

## Step 3: Test Phone Numbers (for development)

Firebase provides test phone numbers that don't require actual SMS:

- Phone: `+1 650-555-1234`
- OTP: `123456`

You can add more test numbers in Firebase Console → Authentication → Sign-in method → Phone → Phone numbers for testing

## Step 4: Verify Firebase Configuration

Make sure your `firebase.ts` has the correct configuration:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyCArKkvgkxZCKhG7bWg3qMcWGi0PjprTpI",
  authDomain: "hand-craft-store.firebaseapp.com",
  projectId: "hand-craft-store",
  // ... rest of config
};
```

## Step 5: Phone Number Format

Make sure users enter phone numbers in E.164 format:
- ✅ Correct: `+919876543210` (India)
- ✅ Correct: `+1234567890` (US)
- ❌ Wrong: `9876543210` (missing country code)
- ❌ Wrong: `919876543210` (missing +)

The code automatically adds `+` if missing, but users must include the country code.

## Step 6: Check Firebase Blaze Plan

Phone Authentication requires a **Blaze (pay-as-you-go) plan**:
1. Go to Firebase Console → Project Settings → Usage and billing
2. Make sure you're on the Blaze plan
3. If not, upgrade to Blaze plan (first $0/month is free, then pay per SMS)

## Step 7: Domain Authorization

Make sure your domain is authorized:
1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add your domain (e.g., `localhost`, `damodarhandicrafts.com`, etc.)

## Troubleshooting

### Error: "Failed to initialize reCAPTCHA Enterprise config"
- This is a warning, not an error. Firebase will fall back to reCAPTCHA v2 automatically.

### Error: "auth/invalid-app-credential"
- Phone authentication is not enabled
- reCAPTCHA is not properly configured
- Domain is not authorized

### Error: "auth/invalid-phone-number"
- Phone number format is incorrect
- Missing country code

### Error: "auth/quota-exceeded"
- SMS quota exceeded
- Upgrade plan or wait for quota reset

## Testing

1. Use test phone numbers during development
2. For production, ensure proper phone number validation
3. Monitor Firebase Console → Authentication → Users for successful signups

## Additional Resources

- [Firebase Phone Auth Documentation](https://firebase.google.com/docs/auth/web/phone-auth)
- [Firebase Pricing](https://firebase.google.com/pricing)
- [reCAPTCHA Setup](https://firebase.google.com/docs/auth/web/phone-auth#set-up-recaptcha-verifier)

