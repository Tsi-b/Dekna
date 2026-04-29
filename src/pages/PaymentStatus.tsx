import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

import SEO from "@/components/SEO";
import { getOrderStatus, verifyPayment } from "@/lib/backend";
import { TextSpinner } from "@/components/ui/text-spinner";
import { toast } from "@/hooks/use-toast";

type Status = "pending" | "verified" | "failed" | "cancelled";

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [autoChecked, setAutoChecked] = useState(false);

  const orderId = useMemo(() => searchParams.get("order_id") || "", [searchParams]);
  // We do not trust query params to mean "success". If tx_ref is present, we
  // may use it only as an identifier to ask the backend for authoritative status.
  const txRef = useMemo(() => searchParams.get("tx_ref") || "", [searchParams]);

  // Auto-check status on page load if order_id or tx_ref is present
  useEffect(() => {
    if (!autoChecked && (orderId || txRef)) {
      setAutoChecked(true);
      onCheckStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, txRef, autoChecked]);

  const onCheckStatus = async () => {
    // Preferred: order_id → backend returns order + payment status (no tx_ref exposure).
    if (orderId) {
      setLoading(true);
      try {
        const res = await getOrderStatus(orderId);
        setStatus(res.payment_status);
        
        // Show success toast for verified payments
        if (res.payment_status === 'verified') {
          toast({
            title: "Payment Successful! ✓",
            description: "Your order has been confirmed and is being processed.",
          });
        } else if (res.payment_status === 'failed') {
          toast({
            title: "Payment Failed",
            description: "Your payment could not be processed. Please try again.",
            variant: "destructive",
          });
        }
        return;
      } catch (err: any) {
        toast({
          title: "Unable to load order status",
          description: err?.message || "Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    // Fallback: tx_ref (if provided)
    if (!txRef) {
      toast({
        title: "Missing identifier",
        description: "No order_id or tx_ref was found. Please open an order from your account.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await verifyPayment(txRef);
      setStatus(res.status);
      
      // Show success toast for verified payments
      if (res.status === 'verified') {
        toast({
          title: "Payment Successful! ✓",
          description: "Your payment has been confirmed.",
        });
      } else if (res.status === 'failed') {
        toast({
          title: "Payment Failed",
          description: "Your payment could not be processed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Unable to verify payment",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Payment Status"
        description="Check your payment status and order confirmation for DEKNA purchases."
        keywords="payment status, order status, payment confirmation"
      />
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">Payment Status</h1>
        <p className="text-muted-foreground mb-6">
          Track your payment and order status in real-time.
        </p>

        <div className="rounded-xl border border-border bg-card p-6 mb-6">
          {/* Order ID Display */}
          <div className="mb-6">
            <div className="text-sm text-muted-foreground mb-2">Order ID</div>
            <div className="font-mono text-base break-all text-card-foreground font-semibold">
              {orderId || "(not provided)"}
            </div>
            {txRef && !orderId && (
              <div className="mt-3">
                <div className="text-sm text-muted-foreground mb-1">Transaction Reference</div>
                <div className="font-mono text-sm break-all text-card-foreground">
                  {txRef}
                </div>
              </div>
            )}
          </div>

          {/* Status Display */}
          {status && (
            <div className="mb-6 p-4 rounded-lg border-2 bg-gray-50 dark:bg-gray-900">
              <div className="text-sm text-muted-foreground mb-3">Payment Status</div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
                  status === 'verified' 
                    ? 'bg-green-100 text-green-800 border-2 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700' 
                    : status === 'failed' || status === 'cancelled'
                      ? 'bg-red-100 text-red-800 border-2 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700'
                      : 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700'
                }`}>
                  {status === 'verified' && '✓ '}
                  {status === 'failed' && '✗ '}
                  {status === 'cancelled' && '✗ '}
                  {status === 'pending' && '⏳ '}
                  {status.toUpperCase()}
                </span>
              </div>
              
              {/* Status Messages */}
              <div className="mt-4 text-sm">
                {status === 'verified' && (
                  <div className="text-green-700 dark:text-green-400">
                    <p className="font-semibold mb-1">✓ Payment Confirmed</p>
                    <p>Your order has been successfully paid and is being processed. You will receive a confirmation email shortly.</p>
                  </div>
                )}
                {status === 'pending' && (
                  <div className="text-yellow-700 dark:text-yellow-400">
                    <p className="font-semibold mb-1">⏳ Payment Pending</p>
                    <p>Your payment is being processed. This usually takes a few moments. Please refresh this page in a minute.</p>
                  </div>
                )}
                {status === 'failed' && (
                  <div className="text-red-700 dark:text-red-400">
                    <p className="font-semibold mb-1">✗ Payment Failed</p>
                    <p>Your payment could not be processed. Please try again or contact support if the issue persists.</p>
                  </div>
                )}
                {status === 'cancelled' && (
                  <div className="text-red-700 dark:text-red-400">
                    <p className="font-semibold mb-1">✗ Payment Cancelled</p>
                    <p>The payment was cancelled. You can try again from your cart.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={onCheckStatus}
              disabled={loading || (!orderId && !txRef)}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
            >
              {loading ? <TextSpinner label="Checking..." /> : status ? "Refresh Status" : "Check Status"}
            </button>

            <Link
              to="/"
              className="text-center sm:text-left text-indigo-600 hover:text-indigo-700 font-medium px-5 py-2.5"
            >
              Return to Shop
            </Link>
            
            {status === 'verified' && orderId && (
              <Link
                to="/account/orders"
                className="text-center sm:text-left text-indigo-600 hover:text-indigo-700 font-medium px-5 py-2.5"
              >
                View Orders
              </Link>
            )}
          </div>
        </div>

        <div className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <p className="font-semibold mb-2">💡 Tip</p>
          <p>You can track all your orders from your Account → Orders page. Payment status is verified with the payment provider in real-time.</p>
        </div>
      </div>
    </div>
    </>
  );
}
