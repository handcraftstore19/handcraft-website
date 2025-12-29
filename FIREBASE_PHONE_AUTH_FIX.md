# Fixing `auth/invalid-app-credential` Error

## What This Error Means

The `auth/invalid-app-credential` error occurs when Firebase cannot properly verify your app's identity during phone authentication. This is usually related to reCAPTCHA initialization or domain authorization.

## Steps to Fix

### 1. Check Authorized Domains ✅

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **Hand Craft Store**
3. Navigate to **Authentication** → **Settings** → **Authorized domains**
4. Ensure these domains are listed:
   - `localhost` (for development)
   - `hand-craft-store.firebaseapp.com` (your Firebase domain)
   - Your production domain (if deployed)
   - `127.0.0.1` (if testing locally)

### 2. Verify Phone Authentication is Enabled ✅

From your screenshot, I can see Phone authentication is enabled. Good!

### 3. Check Firebase Project Configuration

1. Go to **Project Settings** (gear icon in Firebase Console)
2. Under **Your apps**, verify your web app configuration matches:
   - **API Key**: `AIzaSyCArKkvgkxZCKhG7bWg3qMcWGi0PjprTpI`
   - **Auth Domain**: `hand-craft-store.firebaseapp.com`
   - **Project ID**: `hand-craft-store`

### 4. Test with Test Phone Numbers

1. Go to **Authentication** → **Sign-in method** → **Phone**
2. Scroll down to **Phone numbers for testing**
3. Add a test number (e.g., `+1 650-555-3434`)
4. Set a test verification code (e.g., `123456`)
5. Try using this test number in your app

### 5. Clear Browser Cache

Sometimes cached Firebase config can cause issues:
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear browser cache completely
- Try in incognito/private mode

### 6. Check Browser Console for Additional Errors

Look for any other errors that might give more context about the issue.

### 7. Verify reCAPTCHA is Loading

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Filter by "recaptcha"
4. Try sending OTP again
5. Check if reCAPTCHA requests are being made

### 8. Try Using Visible reCAPTCHA (Temporary Test)

If invisible reCAPTCHA continues to fail, we can temporarily switch to visible reCAPTCHA to test if the issue is with the invisible mode.

## Common Causes

1. **Domain not authorized**: Most common cause
2. **reCAPTCHA not loading**: Network or CSP issues
3. **Stale reCAPTCHA verifier**: Previous verifier not properly cleared
4. **Browser blocking reCAPTCHA**: Ad blockers or privacy extensions

## What We've Already Fixed in Code

✅ Improved reCAPTCHA container creation
✅ Better cleanup of previous verifiers
✅ Added proper error handling
✅ Increased wait times for reCAPTCHA initialization

## Next Steps

1. **First, check authorized domains** (Step 1 above) - this is the most likely fix
2. **Try with a test phone number** (Step 4) to see if it's a quota/real number issue
3. **Clear browser cache** and try again
4. If still failing, we can switch to visible reCAPTCHA for testing

## If Still Not Working

If the error persists after checking authorized domains:
1. Try in a different browser
2. Disable browser extensions (especially ad blockers)
3. Check if you're behind a corporate firewall/proxy
4. Verify your Firebase project billing is active (Blaze plan)

Let me know what you find after checking the authorized domains!

