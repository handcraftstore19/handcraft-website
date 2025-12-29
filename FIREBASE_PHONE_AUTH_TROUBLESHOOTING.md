# Firebase Phone Authentication Troubleshooting

## Error: `auth/invalid-app-credential`

This error typically occurs when Phone Authentication is not properly configured in Firebase Console. Follow these steps:

### Step 1: Enable Phone Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Sign-in method**
4. Find **Phone** in the list
5. Click on it and **Enable** it
6. Click **Save**

### Step 2: Verify reCAPTCHA Configuration

1. In the same **Phone** authentication settings
2. Ensure **reCAPTCHA verification** is enabled
3. For production, you may need to add your domain to the authorized domains list

### Step 3: Add Test Phone Numbers (Optional - for development)

1. In **Authentication** → **Sign-in method** → **Phone**
2. Scroll down to **Phone numbers for testing**
3. Click **Add phone number**
4. Add test numbers in E.164 format (e.g., +919876543210)
5. Add the test OTP code (e.g., 123456)

### Step 4: Verify Firebase Project Configuration

1. Go to **Project Settings** (gear icon)
2. Under **Your apps**, verify your web app configuration
3. Ensure the API key is correct in your `.env` file

### Step 5: Check Authorized Domains

1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Ensure your domain is listed:
   - `localhost` (for development)
   - Your production domain (e.g., `damodarhandicrafts.com`)
   - `www.damodarhandicrafts.com` (if using www)

### Step 6: Verify Blaze Plan

Phone Authentication requires a **Blaze (pay-as-you-go)** plan:
1. Go to **Usage and billing** in Firebase Console
2. Verify you're on the Blaze plan
3. If not, upgrade from the Spark (free) plan

### Step 7: Check Browser Console

1. Open browser DevTools (F12)
2. Check the Console tab for any additional error messages
3. Look for reCAPTCHA-related errors

### Common Issues and Solutions

#### Issue: "reCAPTCHA not loading"
- **Solution**: Clear browser cache and cookies
- **Solution**: Try a different browser
- **Solution**: Disable ad blockers temporarily

#### Issue: "Too many requests"
- **Solution**: Wait a few minutes before trying again
- **Solution**: Use test phone numbers during development

#### Issue: "Invalid phone number format"
- **Solution**: Ensure phone number includes country code (e.g., +91 for India)
- **Solution**: Format: `+[country code][phone number]` (e.g., +919876543210)

### Testing with Test Numbers

During development, you can use test phone numbers:
1. Add test numbers in Firebase Console
2. Use the test OTP code (e.g., 123456) when prompted
3. This avoids sending real SMS during development

### Still Having Issues?

If the error persists:
1. Verify your Firebase project is on the Blaze plan
2. Check that Phone Authentication is enabled
3. Ensure reCAPTCHA is properly configured
4. Try clearing the browser cache
5. Check Firebase Console for any quota or billing issues
6. Verify your API key is correct and has the necessary permissions

### Additional Resources

- [Firebase Phone Auth Documentation](https://firebase.google.com/docs/auth/web/phone-auth)
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Support](https://firebase.google.com/support)

