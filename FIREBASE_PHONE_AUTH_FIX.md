# Fixing `auth/invalid-app-credential` Error - COMPLETE GUIDE

## ⚠️ This Error Means

Firebase cannot verify your app's identity. This is **almost always** a configuration issue in Firebase Console or Google Cloud Console.

## 🔧 STEP-BY-STEP FIX (Do These in Order)

### **STEP 1: Add `localhost` to Authorized Domains** ⭐ MOST IMPORTANT

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **Hand Craft Store**
3. Click **Authentication** (left sidebar)
4. Click **Settings** tab (top menu)
5. Scroll down to **Authorized domains** section
6. Click **Add domain** button
7. Type: `localhost` (exactly like this, no http:// or port)
8. Click **Add**
9. **Also add**: `127.0.0.1` (if you're using IP address)

**Expected Result**: You should see:
- `localhost`
- `127.0.0.1` (optional)
- `hand-craft-store.firebaseapp.com` (auto-added)
- `hand-craft-store.web.app` (auto-added)

### **STEP 2: Check API Key Restrictions in Google Cloud Console**

Your API key might be restricted, blocking localhost:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **hand-craft-store** (or your Firebase project)
3. Go to **APIs & Services** → **Credentials**
4. Find your API key: `AIzaSyCArKkvgkxZCKhG7bWg3qMcWGi0PjprTpI`
5. Click on it to edit
6. Check **Application restrictions**:
   - If set to **HTTP referrers**, make sure `localhost:8082/*` is in the list
   - If set to **None**, that's fine
   - If set to **IP addresses**, you need to add your local IP
7. Check **API restrictions**:
   - Should include **Identity Toolkit API** (required for Phone Auth)
   - Or set to **Don't restrict key** (for development)
8. Click **Save**

### **STEP 3: Verify Phone Authentication is Enabled**

1. Firebase Console → **Authentication** → **Sign-in method**
2. Find **Phone** in the list
3. Click on it
4. Ensure it shows **Enabled** (green toggle)
5. If disabled, enable it and click **Save**

### **STEP 4: Use Test Phone Number (Bypass SMS)**

This helps test if the issue is with SMS or configuration:

1. Firebase Console → **Authentication** → **Sign-in method** → **Phone**
2. Scroll to **Phone numbers for testing**
3. Click **Add phone number**
4. Enter: `+1 650-555-3434` (or any test number)
5. Enter test code: `123456`
6. Click **Add**
7. In your app, use this test number to sign up
8. When OTP is requested, enter: `123456`

**If test number works**: The issue is with SMS/real numbers, not configuration.
**If test number fails**: Configuration issue (go back to Steps 1-2).

### **STEP 5: Clear Browser Cache & Hard Refresh**

1. Close all browser tabs with your app
2. Open browser DevTools (F12)
3. Right-click the refresh button
4. Select **Empty Cache and Hard Reload**
5. Or manually: `Ctrl+Shift+Delete` → Clear cached images and files

### **STEP 6: Check Browser Console for Detailed Errors**

After trying to send OTP, check the console for:
- Full error object (now logged with our fix)
- Network tab → Look for failed requests to `identitytoolkit.googleapis.com`
- Check the response body for more details

### **STEP 7: Try Different Browser/Incognito**

1. Open incognito/private window
2. Disable all browser extensions (especially ad blockers)
3. Try sending OTP again

## 🎯 Quick Checklist

Before asking for help, verify:

- [ ] `localhost` is in Firebase Authorized domains
- [ ] API key has no restrictions OR includes `localhost:8082/*`
- [ ] Phone Authentication is **Enabled** in Firebase
- [ ] You're on **Blaze plan** (not Spark)
- [ ] Browser cache is cleared
- [ ] Tried test phone number
- [ ] Checked browser console for full error details

## 🔍 Debugging: Check Network Tab

1. Open DevTools → **Network** tab
2. Filter by: `identitytoolkit`
3. Try sending OTP
4. Click on the failed request
5. Check **Response** tab for error details
6. Check **Headers** tab → **Request URL** to see full API call

## 🚨 Common Issues & Solutions

### Issue: "localhost not in authorized domains"
**Solution**: Follow Step 1 above

### Issue: "API key restricted"
**Solution**: Follow Step 2 above, set restrictions to "None" for development

### Issue: "Phone auth not enabled"
**Solution**: Follow Step 3 above

### Issue: "Quota exceeded"
**Solution**: 
- Use test phone numbers (Step 4)
- Wait 24 hours for quota reset
- Upgrade to Identity Platform for higher limits

### Issue: "reCAPTCHA not loading"
**Solution**:
- Disable ad blockers
- Check browser console for CSP errors
- Try different browser

## 📞 Still Not Working?

If you've completed all steps above and it still fails:

1. **Check the browser console** - we now log full error details
2. **Share the full error object** from console
3. **Verify your Firebase project ID** matches in code
4. **Check if you have multiple Firebase projects** - make sure you're using the right one

## 🧪 Alternative: Use Visible reCAPTCHA (Temporary)

If invisible reCAPTCHA keeps failing, we can temporarily switch to visible reCAPTCHA. This will show a checkbox that users need to click, but it might work around the configuration issue.

Let me know if you want me to implement this temporary workaround.

---

**Most Common Fix**: 90% of the time, it's Step 1 (adding `localhost` to authorized domains). Make sure you do that first!
