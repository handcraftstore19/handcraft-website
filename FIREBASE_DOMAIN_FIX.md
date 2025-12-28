# Firebase Unauthorized Domain Error - Fix Guide

## Problem
You're getting this error:
```
Firebase: Error (auth/unauthorized-domain)
The current domain is not authorized for OAuth operations.
```

This happens when trying to use Google Sign-In (or other OAuth providers) from a domain that hasn't been authorized in Firebase Console.

## Solution: Add Your Domain to Firebase Console

### Step-by-Step Instructions:

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: `hand-craft-store`

2. **Navigate to Authentication Settings**
   - Click on **Authentication** in the left sidebar
   - Click on the **Settings** tab (gear icon)
   - Scroll down to **Authorized domains** section

3. **Add Your Domains**
   - Click the **Add domain** button
   - Add the following domains (one at a time):
     - `www.damodarhandicrafts.com`
     - `damodarhandicrafts.com` (without www)
     - `localhost` (for local development)
     - Your Vercel/deployment domain (if different)

4. **Save Changes**
   - After adding each domain, click **Add**
   - Changes take effect immediately (no need to redeploy)

### Important Notes:

- **Both www and non-www versions**: Add both `www.damodarhandicrafts.com` and `damodarhandicrafts.com` separately
- **Local development**: Keep `localhost` in the list for testing
- **Subdomains**: If you have subdomains (e.g., `app.damodarhandicrafts.com`), add them separately
- **No redeployment needed**: Changes take effect immediately after saving

### Default Authorized Domains:

Firebase automatically includes:
- `localhost` (for local development)
- `*.firebaseapp.com` (Firebase hosting)
- `*.web.app` (Firebase hosting)

You need to manually add your custom domain.

## Verification

After adding the domain:
1. Wait a few seconds for changes to propagate
2. Try Google Sign-In again
3. The error should be resolved

## If Error Persists:

1. **Check domain spelling**: Ensure the domain matches exactly (case-sensitive)
2. **Clear browser cache**: Sometimes cached auth state causes issues
3. **Check Firebase project**: Ensure you're using the correct Firebase project
4. **Verify authDomain**: Check `src/lib/firebase.ts` - the `authDomain` should match your Firebase project

## Current Firebase Configuration:

Your current `authDomain` is: `hand-craft-store.firebaseapp.com`

This is correct and doesn't need to be changed. You just need to add your custom domain to the authorized domains list.

