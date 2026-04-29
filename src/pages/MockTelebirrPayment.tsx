import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

import SEO from '@/components/SEO';

/**
 * Mock Telebirr Payment Page (Development Only)
 * 
 * Simulates the Telebirr payment gateway interface for testing.
 * In production, users would be redirected to the actual Telebirr gateway.
 */
const MockTelebirrPayment: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const prepayId = searchParams.get('prepay_id') || '';
  const merchOrderId = searchParams.get('merch_order_id') || '';
  const orderId = searchParams.get('order_id') || '';
  const isMock = searchParams.get('mock') === '1';

  useEffect(() => {
    // Verify this is a mock payment
    if (!isMock) {
      navigate('/');
    }
  }, [isMock, navigate]);

  const handlePaymentSuccess = () => {
    setProcessing(true);
    // Simulate payment processing delay
    setTimeout(() => {
      // Redirect to payment status page with success parameters
      const returnUrl = `/payment-status?mock=1&prepay_id=${prepayId}&merch_order_id=${merchOrderId}&order_id=${orderId}&status=success`;
      window.location.href = returnUrl;
    }, 2000);
  };

  const handlePaymentFailure = () => {
    setProcessing(true);
    // Simulate payment processing delay
    setTimeout(() => {
      // Redirect to payment status page with failure parameters
      const returnUrl = `/payment-status?mock=1&prepay_id=${prepayId}&merch_order_id=${merchOrderId}&order_id=${orderId}&status=failed`;
      window.location.href = returnUrl;
    }, 2000);
  };

  const handleCancel = () => {
    // Redirect to payment status page with cancelled status
    const returnUrl = `/payment-status?mock=1&prepay_id=${prepayId}&merch_order_id=${merchOrderId}&order_id=${orderId}&status=cancelled`;
    window.location.href = returnUrl;
  };

  if (!isMock) {
    return null;
  }

  return (
    <>
      <SEO
        title="Payment"
        description="Complete your payment securely with Telebirr."
        keywords="payment, telebirr, checkout"
      />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-3xl">T</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Telebirr Payment Gateway
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Mock Payment Page (Development Mode)
          </p>
        </div>

        {/* Payment Details */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
            <span className="font-mono text-gray-900 dark:text-white">{orderId.slice(0, 8)}...</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Merchant Order:</span>
            <span className="font-mono text-gray-900 dark:text-white">{merchOrderId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Prepay ID:</span>
            <span className="font-mono text-gray-900 dark:text-white">{prepayId.slice(0, 12)}...</span>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Development Mode:</strong> This is a mock payment page. In production, users will be redirected to the actual Telebirr gateway.
          </p>
        </div>

        {/* Action Buttons */}
        {processing ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Processing payment...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handlePaymentSuccess}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <CheckCircle className="w-5 h-5" />
              Simulate Successful Payment
            </button>
            
            <button
              onClick={handlePaymentFailure}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <XCircle className="w-5 h-5" />
              Simulate Failed Payment
            </button>
            
            <button
              onClick={handleCancel}
              className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white py-3.5 rounded-xl font-semibold transition-colors"
            >
              Cancel Payment
            </button>
          </div>
        )}

        {/* Footer */}
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-6">
          This mock page allows you to test payment success, failure, and cancellation scenarios without connecting to the real Telebirr gateway.
        </p>
      </div>
    </div>
    </>
  );
};

export default MockTelebirrPayment;
