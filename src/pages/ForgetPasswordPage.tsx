import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Lock, ArrowLeft } from 'lucide-react';
import PasswordInput from '@/components/PasswordInput';
import { formatPhoneNumber, validatePhoneNumber } from '@/services/otpService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { countryCodes, getDefaultCountry, type CountryCode } from '@/data/countryCodes';

const ForgetPasswordPage = () => {
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(getDefaultCountry());
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [step, setStep] = useState<'phone' | 'otp' | 'password'>('phone');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const { forgetPassword, resetPassword, sendOTP } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async () => {
    setError('');
    
    // Validate phone number (should have at least 10 digits)
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setError('Please enter a valid phone number (at least 10 digits)');
      return;
    }

    setSendingOTP(true);
    // Combine country code with phone number
    const phoneNumber = phone.startsWith('+') ? phone : `${selectedCountry.dialCode}${phone.replace(/\D/g, '')}`;
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    try {
      await forgetPassword(formattedPhone);
      setOtpSent(true);
      setStep('otp');
      setCountdown(60);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setSendingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');
    
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    // Just move to password step - OTP will be verified when resetting password
    // This prevents sending a new OTP which would invalidate the current one
    setStep('password');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    // Combine country code with phone number
    const phoneNumber = phone.startsWith('+') ? phone : `${selectedCountry.dialCode}${phone.replace(/\D/g, '')}`;
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    try {
      await resetPassword(formattedPhone, otp, newPassword);
      // Show success message
      setError('');
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Reset Password
            </CardTitle>
            <CardDescription>
              {step === 'phone' && 'Enter your phone number to receive OTP'}
              {step === 'otp' && 'Enter the OTP sent to your phone'}
              {step === 'password' && 'Set your new password'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'phone' && (
              <div className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex gap-2">
                    <Select
                      value={selectedCountry.code}
                      onValueChange={(value) => {
                        const country = countryCodes.find(c => c.code === value);
                        if (country) {
                          setSelectedCountry(country);
                        }
                      }}
                      disabled={sendingOTP}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue>
                          <span className="flex items-center gap-2">
                            <span>{selectedCountry.flag}</span>
                            <span>{selectedCountry.dialCode}</span>
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {countryCodes.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            <span className="flex items-center gap-2">
                              <span>{country.flag}</span>
                              <span>{country.dialCode}</span>
                              <span className="text-muted-foreground">{country.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => {
                        // Only allow digits
                        const digits = e.target.value.replace(/\D/g, '');
                        setPhone(digits);
                      }}
                      required
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={sendingOTP || phone.length < 10}
                      variant="outline"
                    >
                      {sendingOTP ? 'Sending...' : 'Send OTP'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter your phone number (country code is selected above)
                  </p>
                </div>

                <div className="text-center">
                  <Link to="/login" className="text-sm text-primary hover:underline flex items-center justify-center gap-1">
                    <ArrowLeft className="h-3 w-3" />
                    Back to Login
                  </Link>
                </div>
              </div>
            )}

            {step === 'otp' && (
              <div className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                  <p className="text-xs text-muted-foreground">
                    Enter the 6-digit code sent to your phone
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setStep('phone');
                      setOtp('');
                    }}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleVerifyOTP}
                    disabled={loading || otp.length !== 6}
                    className="flex-1"
                  >
                    {loading ? 'Verifying...' : 'Verify'}
                  </Button>
                </div>

                {countdown > 0 && (
                  <p className="text-center text-sm text-muted-foreground">
                    Resend OTP in {countdown}s
                  </p>
                )}
              </div>
            )}

            {step === 'password' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {success && (
                  <div className="p-3 rounded-lg bg-green-500/10 text-green-600 text-sm">
                    {success}
                  </div>
                )}
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <PasswordInput
                    id="newPassword"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>

                <div className="text-center">
                  <Link to="/login" className="text-sm text-primary hover:underline">
                    Back to Login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default ForgetPasswordPage;

