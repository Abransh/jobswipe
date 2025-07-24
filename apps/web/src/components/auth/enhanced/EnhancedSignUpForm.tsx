'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@jobswipe/shared/browser';
import { AuthSource } from '@jobswipe/shared';
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  Check, 
  X, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Globe,
  Lock,
  Mail,
  User
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { debounce } from '@/lib/utils';

import { OAuthProviders } from '../OAuthProviders';
import { FormInput } from '../FormInput';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const signUpSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, 
      'Password must contain uppercase, lowercase, number, and special character'),
  confirmPassword: z.string(),
  termsAccepted: z.boolean().refine((val) => val === true, 'You must accept the terms and conditions'),
  privacyAccepted: z.boolean().refine((val) => val === true, 'You must accept the privacy policy'),
  marketingConsent: z.boolean().optional(),
  timezone: z.string().optional(),
  companySize: z.string().optional(),
  industry: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: 'red' | 'orange' | 'yellow' | 'green';
}

interface SecurityEvent {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  timestamp: Date;
}

const passwordRequirements = [
  { label: 'At least 8 characters', test: (password: string) => password.length >= 8 },
  { label: 'Contains uppercase letter', test: (password: string) => /[A-Z]/.test(password) },
  { label: 'Contains lowercase letter', test: (password: string) => /[a-z]/.test(password) },
  { label: 'Contains number', test: (password: string) => /\d/.test(password) },
  { label: 'Contains special character', test: (password: string) => /[!@#$%^&*(),.?":{}|<>]/.test(password) },
];

const companyTypes = [
  'Startup (1-50 employees)',
  'SMB (51-200 employees)',
  'Mid-market (201-1000 employees)',
  'Enterprise (1000+ employees)',
  'Government',
  'Non-profit',
  'Other'
];

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Consulting',
  'Media',
  'Government',
  'Other'
];

export function EnhancedSignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: 'red'
  });
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [userTimezone, setUserTimezone] = useState<string>('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  // Use the custom auth context
  const { register: registerUser, isLoading, error, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
    defaultValues: {
      timezone: userTimezone,
    }
  });

  const password = watch('password') || '';
  const confirmPassword = watch('confirmPassword') || '';
  const email = watch('email') || '';

  // Detect user timezone
  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setUserTimezone(timezone);
  }, []);

  // Add security event
  const addSecurityEvent = (type: SecurityEvent['type'], message: string) => {
    setSecurityEvents(prev => [...prev.slice(-4), {
      type,
      message,
      timestamp: new Date(),
    }]);
  };

  // Calculate password strength
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    if (!password) return { score: 0, feedback: [], color: 'red' };
    
    let score = 0;
    const feedback: string[] = [];
    
    // Length check
    if (password.length >= 8) score += 2;
    else if (password.length >= 6) score += 1;
    else feedback.push('Password too short');
    
    // Character variety
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Add lowercase letters');
    
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Add uppercase letters');
    
    if (/\d/.test(password)) score += 1;
    else feedback.push('Add numbers');
    
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push('Add special characters');
    
    // Bonus points for length
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    
    // Determine color and feedback
    let color: 'red' | 'orange' | 'yellow' | 'green' = 'red';
    if (score >= 7) color = 'green';
    else if (score >= 5) color = 'yellow';
    else if (score >= 3) color = 'orange';
    
    return { score, feedback, color };
  };

  // Check email availability (debounced)
  const checkEmailAvailability = debounce(async (email: string) => {
    if (!email || !z.string().email().safeParse(email).success) {
      setEmailAvailable(null);
      return;
    }
    
    setIsCheckingEmail(true);
    
    try {
      // Call the backend API directly
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiBaseUrl}/v1/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      setEmailAvailable(data.available);
      
      if (!data.available) {
        addSecurityEvent('warning', 'Email already registered');
      }
    } catch (error) {
      // In case of error, assume email is available
      setEmailAvailable(true);
    } finally {
      setIsCheckingEmail(false);
    }
  }, 500);

  // Update password strength when password changes
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  // Check email availability when email changes
  useEffect(() => {
    if (email) {
      checkEmailAvailability(email);
    }
  }, [email]);

  // Get email validation status
  const getEmailValidationStatus = () => {
    if (!email) return null;
    if (errors.email) return 'error';
    if (emailAvailable === false) return 'error';
    if (emailAvailable === true) return 'success';
    return null;
  };

  // Get password match status
  const getPasswordMatchStatus = () => {
    if (!confirmPassword) return null;
    if (password === confirmPassword) return 'success';
    return 'error';
  };

  const onSubmit = async (data: SignUpFormData) => {
    // Clear any existing errors
    clearError();

    try {
      addSecurityEvent('info', 'Registration attempt initiated');

      // Check email availability one more time
      if (emailAvailable === false) {
        addSecurityEvent('error', 'Email already exists');
        return;
      }

      const response = await registerUser({
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`,
        firstName: data.firstName,
        lastName: data.lastName,
        source: AuthSource.WEB,
        termsAccepted: data.termsAccepted,
        privacyAccepted: data.privacyAccepted,
        marketingConsent: data.marketingConsent || false,
        timezone: data.timezone || userTimezone,
      });

      if (response.success && response.user) {
        addSecurityEvent('success', 'Registration successful');
        // Redirect to callback URL on successful registration
        router.push(callbackUrl);
      } else {
        // Handle specific error cases
        let errorMessage = error || 'Registration failed';
        
        if (error?.includes('already exists')) {
          addSecurityEvent('error', 'Duplicate account detected');
        } else if (error?.includes('disabled')) {
          addSecurityEvent('error', 'Registration access denied');
        } else if (error?.includes('validation')) {
          addSecurityEvent('error', 'Registration validation failed');
        } else {
          addSecurityEvent('error', 'Unknown registration error');
        }
      }
    } catch (error: any) {
      addSecurityEvent('error', 'Unexpected registration error');
      // Error is automatically handled by the auth context
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Status */}
      {securityEvents.length > 0 && (
        <div className="space-y-2">
          {securityEvents.slice(-2).map((event, index) => (
            <Alert key={index} variant={event.type === 'error' ? 'destructive' : 'default'}>
              <div className="flex items-center space-x-2">
                {event.type === 'success' && <CheckCircle className="h-4 w-4" />}
                {event.type === 'error' && <AlertTriangle className="h-4 w-4" />}
                {event.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
                {event.type === 'info' && <Info className="h-4 w-4" />}
                <AlertDescription>{event.message}</AlertDescription>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* OAuth Providers */}
      <OAuthProviders callbackUrl={callbackUrl} />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or create an account</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Sign Up Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <User className="h-4 w-4" />
            <span>Personal Information</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              id="firstName"
              label="First name"
              type="text"
              autoComplete="given-name"
              required
              {...register('firstName')}
              error={errors.firstName?.message}
            />

            <FormInput
              id="lastName"
              label="Last name"
              type="text"
              autoComplete="family-name"
              required
              {...register('lastName')}
              error={errors.lastName?.message}
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <Mail className="h-4 w-4" />
            <span>Email & Authentication</span>
          </div>
          
          <div className="relative">
            <FormInput
              id="email"
              label="Email address"
              type="email"
              autoComplete="email"
              required
              {...register('email')}
              error={errors.email?.message || (emailAvailable === false ? 'Email is already registered' : undefined)}
            />
            {/* Email validation indicator */}
            <div className="absolute right-3 top-8 flex items-center">
              {isCheckingEmail && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
              {!isCheckingEmail && getEmailValidationStatus() === 'success' && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              {!isCheckingEmail && getEmailValidationStatus() === 'error' && (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <Lock className="h-4 w-4" />
            <span>Password Security</span>
          </div>
          
          <div className="space-y-2">
            <div className="relative">
              <FormInput
                id="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                {...register('password')}
                error={errors.password?.message}
              />
              <button
                type="button"
                className="absolute right-3 top-8 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Password strength:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.color === 'red' ? 'bg-red-500' :
                        passwordStrength.color === 'orange' ? 'bg-orange-500' :
                        passwordStrength.color === 'yellow' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength.score / 8) * 100}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${
                    passwordStrength.color === 'red' ? 'text-red-600' :
                    passwordStrength.color === 'orange' ? 'text-orange-600' :
                    passwordStrength.color === 'yellow' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {passwordStrength.score >= 7 ? 'Strong' :
                     passwordStrength.score >= 5 ? 'Good' :
                     passwordStrength.score >= 3 ? 'Fair' : 'Weak'}
                  </span>
                </div>
                
                {/* Password Requirements */}
                <div className="space-y-1">
                  {passwordRequirements.map((req) => (
                    <div key={req.label} className="flex items-center text-sm">
                      {req.test(password) ? (
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      <span className={req.test(password) ? 'text-green-600' : 'text-red-600'}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <FormInput
              id="confirmPassword"
              label="Confirm password"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />
            <button
              type="button"
              className="absolute right-10 top-8 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
            {/* Password match indicator */}
            <div className="absolute right-3 top-8 flex items-center">
              {getPasswordMatchStatus() === 'success' && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              {getPasswordMatchStatus() === 'error' && (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
        </div>

        {/* Optional Professional Information */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <Globe className="h-4 w-4" />
            <span>Professional Information (Optional)</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Size
              </label>
              <select
                {...register('companySize')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select company size</option>
                {companyTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry
              </label>
              <select
                {...register('industry')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select industry</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Terms and Privacy */}
        <div className="space-y-4">
          <div className="flex items-start">
            <input
              id="termsAccepted"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              {...register('termsAccepted')}
            />
            <label htmlFor="termsAccepted" className="ml-2 block text-sm text-gray-900">
              I agree to the{' '}
              <a href="/terms" className="text-blue-600 hover:text-blue-500 underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-blue-600 hover:text-blue-500 underline">
                Privacy Policy
              </a>
            </label>
          </div>
          {errors.termsAccepted && (
            <p className="text-sm text-red-600">{errors.termsAccepted.message}</p>
          )}

          <div className="flex items-start">
            <input
              id="privacyAccepted"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              {...register('privacyAccepted')}
            />
            <label htmlFor="privacyAccepted" className="ml-2 block text-sm text-gray-900">
              I consent to the processing of my personal data as described in the Privacy Policy
            </label>
          </div>
          {errors.privacyAccepted && (
            <p className="text-sm text-red-600">{errors.privacyAccepted.message}</p>
          )}

          <div className="flex items-start">
            <input
              id="marketingConsent"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              {...register('marketingConsent')}
            />
            <label htmlFor="marketingConsent" className="ml-2 block text-sm text-gray-900">
              I would like to receive marketing communications and product updates
            </label>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !isValid || emailAvailable === false}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Create secure account
            </>
          )}
        </Button>
      </form>

      {/* Security Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900">Enterprise Security</p>
            <p className="text-blue-700 mt-1">
              Your account is protected with enterprise-grade security including encrypted data storage,
              secure authentication, and compliance with industry standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}