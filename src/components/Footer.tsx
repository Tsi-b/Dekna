import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, ArrowRight, Check, AlertCircle, Loader2 } from 'lucide-react';
import { subscribeNewsletter } from '@/lib/backend';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const footerLinkClass =
    'text-gray-400 dark:text-gray-600 visited:text-gray-400 dark:visited:text-gray-600 hover:text-white dark:hover:text-gray-900 visited:hover:text-white dark:visited:hover:text-gray-900 transition-colors';

  const validateEmail = (email: string): boolean => {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setError('');
    setSuccess(false);

    // Validate email
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      await subscribeNewsletter(trimmedEmail, 'footer');
      
      setSuccess(true);
      setEmail('');
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);

    } catch (err: any) {
      // Handle specific error messages from backend
      if (err.message.includes('already subscribed')) {
        setError('This email is already subscribed to our newsletter');
      } else if (err.message.includes('Invalid email')) {
        setError('Please enter a valid email address');
      } else {
        setError('Failed to subscribe. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const scrollToHeader = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 dark:bg-[#FAF8F3] text-white dark:text-gray-900">
      {/* Newsletter Section */}
      <div className="bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-bold mb-2">Join the DEKNA Family</h3>
              <p className="text-indigo-100">
                Get 15% off your first order + exclusive parenting tips & deals
              </p>
            </div>
            <div className="w-full max-w-md">
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(''); // Clear error on input
                  }}
                  disabled={loading || success}
                  className={`flex-1 px-4 py-3 sm:rounded-l-xl rounded-xl sm:rounded-r-none text-gray-900 focus:outline-none bg-white/95 placeholder:text-gray-500 disabled:opacity-60 disabled:cursor-not-allowed ${
                    error ? 'ring-2 ring-red-500' : ''
                  }`}
                  required
                />
                <button
                  type="submit"
                  disabled={loading || success}
                  className={`px-6 py-3 rounded-xl sm:rounded-l-none sm:rounded-r-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed min-w-[140px] ${
                    success
                      ? 'bg-green-500 text-white'
                      : loading
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Subscribing...
                    </>
                  ) : success ? (
                    <>
                      <Check className="w-5 h-5" />
                      Subscribed!
                    </>
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
              
              {/* Error Message */}
              {error && (
                <div className="mt-2 flex items-center gap-2 text-red-100 bg-red-500/20 px-3 py-2 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              {/* Success Message */}
              {success && (
                <div className="mt-2 flex items-center gap-2 text-green-100 bg-green-500/20 px-3 py-2 rounded-lg text-sm">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>Thank you for subscribing! Check your inbox for exclusive offers.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">7</span>
              </div>
              <div>
                <span className="font-bold text-xl">DEKNA</span>
                <span className="text-xs text-gray-400 dark:text-gray-600 block -mt-1">KidsGoods Shop</span>
              </div>
            </div>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Help</h4>
            <ul className="space-y-3">
              <li><Link to="/about-us" onClick={scrollToHeader} className={footerLinkClass}>About Us</Link></li>
              <li><Link to="/search" onClick={scrollToHeader} className={footerLinkClass}>Search</Link></li>
              <li><Link to="/refund-policy" onClick={scrollToHeader} className={footerLinkClass}>Refund policy</Link></li>
              <li><Link to="/returns-refunds" onClick={scrollToHeader} className={footerLinkClass}>Returns &amp; Refunds</Link></li>
              <li><Link to="/app-download" onClick={scrollToHeader} className={footerLinkClass}>App Download</Link></li>
              <li><Link to="/terms-of-service" onClick={scrollToHeader} className={footerLinkClass}>Terms of Service</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 dark:border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="text-sm text-gray-400 dark:text-gray-600 text-center md:text-left">
              © 2025 DEKNA KidsGoods Shop. All rights reserved.
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-center gap-x-6 gap-y-2 text-sm">
              <Link to="/privacy-policy" onClick={scrollToHeader} className={footerLinkClass}>Privacy Policy</Link>
              <Link to="/terms-of-service" onClick={scrollToHeader} className={footerLinkClass}>Terms of Service</Link>
            </div>
            <div className="flex items-center justify-center md:justify-end gap-3">
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-indigo-600 dark:bg-gray-800 dark:hover:!bg-indigo-600 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-pink-600 dark:bg-gray-800 dark:hover:!bg-pink-600 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-blue-500 dark:bg-gray-800 dark:hover:!bg-blue-500 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://www.youtube.com/@DEKNA_21"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-red-600 dark:bg-gray-800 dark:hover:!bg-red-600 rounded-lg flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
