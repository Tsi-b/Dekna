import React, { useState, useEffect, useMemo } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Check, AlertCircle, CheckCircle2, Circle } from 'lucide-react';
import { TextSpinner } from '@/components/ui/text-spinner';
import { useAuth } from '@/hooks/use-auth';
import { useLocation, useNavigate } from 'react-router-dom';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

interface PasswordRequirementProps {
  met: boolean;
  text: string;
  touched: boolean;
}

const PasswordRequirement: React.FC<PasswordRequirementProps> = ({ met, text, touched }) => {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
      ) : (
        <Circle className={`w-4 h-4 flex-shrink-0 ${touched ? 'text-red-500 dark:text-red-400' : 'text-gray-400'}`} />
      )}
      <span className={`text-xs ${met ? 'text-green-700 dark:text-green-400 font-medium' : touched ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
        {text}
      </span>
    </div>
  );
};

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { signIn, signUp, signingIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const nextPath = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get('next') || '';
  }, [location.search]);

  const intent = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get('intent') || '';
  }, [location.search]);

  const backLabel = useMemo(() => {
    // Keep this copy simple and action-oriented.
    if (intent === 'checkout') return 'Back to checkout';
    if (intent === 'wishlist') return 'Back to product';
    if (intent === 'sign-in') return 'Back';
    if (nextPath) return 'Back';
    return 'Close';
  }, [intent, nextPath]);
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Use centralized auth in-progress state for consistent timing with sign-out.
  const effectiveLoading = loading || signingIn;
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password validation state
  const [passwordTouched, setPasswordTouched] = useState(false);
  
  // Password validation rules
  const passwordValidation = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
  }, [password]);

  const isPasswordValid = useMemo(() => {
    return Object.values(passwordValidation).every(Boolean);
  }, [passwordValidation]);

  // Auto-close the auth modal whenever a user is actually signed in.
  // This ensures the DEKNA "Welcome Back" screen disappears immediately
  // after successful authentication, even if the direct signIn call
  // returns an error object but the session/user is established.
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && user) {
      onClose();
    }
  }, [isOpen, user, onClose]);

  // Reset local form state whenever the modal is opened fresh.
  useEffect(() => {
    if (isOpen) {
      setLoading(false);
      setError('');
      setSuccess('');
      setMode(initialMode);
      setPasswordTouched(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const start = performance.now();

    try {
      if (mode === 'signup') {
        if (!fullName.trim()) {
          setError('Please enter your full name');
          setLoading(false);
          return;
        }
        if (!isPasswordValid) {
          setError('Please ensure your password meets all security requirements');
          setPasswordTouched(true);
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Account created! Please check your email to verify your account.');
          setTimeout(() => {
            setMode('login');
            setSuccess('');
          }, 3000);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          // Prefer deterministic post-auth navigation when opened as a gate.
          // Falling back to onClose() preserves the prior behavior.
          setLoading(false);
          if (nextPath) {
            navigate(nextPath, { replace: true });
          } else {
            onClose();
          }
          return;
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      // Local loading flag is cleared immediately; AuthContext.signingIn enforces min duration.
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setSuccess('');
    setPasswordTouched(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-950 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white">
          <button
            onClick={onClose}
            aria-label={backLabel}
            title={backLabel}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold">7</span>
            </div>
            <div>
              <span className="font-bold text-xl">DEKNA</span>
              <span className="text-xs text-indigo-200 block">KidsGoods Shop</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold">
            {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
          </h2>
          <p className="text-indigo-100 mt-1">
            {mode === 'login'
              ? nextPath
                ? 'Sign in to continue to checkout'
                : 'Sign in to access your account'
              : 'Join the DEKNA family today'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl">
              <Check className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {/* Full Name (Sign Up only) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                  required
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => mode === 'signup' && setPasswordTouched(true)}
                placeholder={mode === 'signup' ? 'Create a strong password' : 'Enter your password'}
                className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                required
                minLength={mode === 'signup' ? 8 : 6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
            
            {/* Password Requirements - Sign Up Only */}
            {mode === 'signup' && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Password must contain:
                </p>
                <div className="space-y-1.5">
                  <PasswordRequirement
                    met={passwordValidation.minLength}
                    text="At least 8 characters"
                    touched={passwordTouched}
                  />
                  <PasswordRequirement
                    met={passwordValidation.hasUppercase}
                    text="At least 1 uppercase letter (A-Z)"
                    touched={passwordTouched}
                  />
                  <PasswordRequirement
                    met={passwordValidation.hasLowercase}
                    text="At least 1 lowercase letter (a-z)"
                    touched={passwordTouched}
                  />
                  <PasswordRequirement
                    met={passwordValidation.hasNumber}
                    text="At least 1 number (0-9)"
                    touched={passwordTouched}
                  />
                  <PasswordRequirement
                    met={passwordValidation.hasSpecial}
                    text="At least 1 special character (!@#$%^&*)"
                    touched={passwordTouched}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Forgot Password (Login only) */}
          {mode === 'login' && (
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={effectiveLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            {effectiveLoading ? (
              <TextSpinner label={mode === 'login' ? 'Signing in...' : 'Creating account...'} />
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>

          {/* Switch Mode */}
          <p className="text-center text-gray-600 dark:text-gray-300">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={switchMode}
              className="text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          {/* Terms (Sign Up only) */}
          {mode === 'signup' && (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
