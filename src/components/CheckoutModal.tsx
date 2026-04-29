import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { X, ArrowLeft, ArrowRight, Truck, Gift, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { TextSpinner } from '@/components/ui/text-spinner';
import { CartItem } from '@/types';
import { initiatePayment } from '@/lib/backend';
import { useTelebirrCheckout } from '@/hooks/useTelebirrCheckout';
import { toast } from '@/hooks/use-toast';
import { formatMoney } from '@/lib/money';
import {
  CHECKOUT_CURRENCY,
  GIFT_WRAP_FEE,
  PAYMENT_PROVIDER_NAME,
  SHIPPING_FEE,
  SHIPPING_FREE_THRESHOLD,
  TAX_RATE,
} from '@/lib/checkout_constants';
import SellerMeta from '@/components/SellerMeta';
import BestOfferNotice from '@/components/BestOfferNotice';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderComplete: () => void;
  onSignInClick: () => void;
  onChangeSeller: (productId: string, offerId?: string) => void;
}

type Step = 'shipping' | 'payment' | 'confirmation';

// In a backend-authoritative payment flow, the frontend should not create orders.
// Developers should seed mock orders (dev) and select one to initiate payment.


const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onOrderComplete,
  onSignInClick,
  onChangeSeller,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { user, addresses, orders } = useAuth();
  const stepFromUrl = (params.step as Step | undefined) || 'shipping';
  const [step, setStep] = useState<Step>(stepFromUrl);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Telebirr C2B checkout (independent of Chapa)
  const { initiate: _initiateTelebirr, loading: telebirrLoading, error: telebirrError } =
    useTelebirrCheckout({ orderId });

  // Wrap to also advance the step on success (redirect happens inside the hook)
  const initiateTelebirr = async () => {
    await _initiateTelebirr();
    // If no error was thrown, the browser is redirecting — advance step optimistically
    if (!telebirrError) {
      setStepAndNavigate('confirmation');
      onOrderComplete();
    }
  };
  const payableOrders = (orders || []).filter((o) => o.status === 'created');
  // Shipping form
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find(a => a.is_default)?.id || ''
  );

  // Keep the visible step in sync with auth state when the modal opens.
  // - Guest users should see the auth/guest choice.
  // - Signed-in users should not see the auth step; they go to payment (preferred)
  //   or shipping if no address is available.
  const setStepAndNavigate = (next: Step) => {
    setStep(next);
    // Keep URL in sync (route-driven checkout)
    navigate(`/checkout/${next}`);
  };

  // Sync local step state from URL whenever checkout is opened or the URL step changes.
  useEffect(() => {
    if (!isOpen) return;

    // Guest checkout is allowed (auth is required only to initiate payment).
    if (!user) {
      const normalizedStep = stepFromUrl;
      setStep(normalizedStep);
      if (location.pathname !== `/checkout/${normalizedStep}`) {
        navigate(`/checkout/${normalizedStep}`, { replace: true });
      }
      return;
    }

    const defaultAddressId = addresses.find((a) => a.is_default)?.id || addresses[0]?.id || '';

    const normalizedStep = stepFromUrl;

    setStep(normalizedStep);
    if (location.pathname !== `/checkout/${normalizedStep}`) {
      navigate(`/checkout/${normalizedStep}`, { replace: true });
    }

    if (defaultAddressId) {
      setSelectedAddressId(defaultAddressId);
    }
  }, [isOpen, user, addresses, stepFromUrl, location.pathname, navigate]);
  const [shippingForm, setShippingForm] = useState({
    full_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: '',
    phone: ''
  });

  // Payment form
  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.selectedOffer?.price ?? item.product.price) * item.quantity,
    0
  );
  const giftWrapTotal = cartItems.filter(item => item.giftWrap).length * GIFT_WRAP_FEE;
  const shipping = subtotal > SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_FEE;
  const tax = (subtotal + giftWrapTotal) * TAX_RATE; // tax (configurable)
  const total = subtotal + giftWrapTotal + shipping + tax;


  const handlePlaceOrder = async () => {
    setLoading(true);

    try {
      if (!user) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to continue with payment.',
          variant: 'destructive',
        });
        onSignInClick();
        return;
      }

      if (!orderId) {
        toast({
          title: 'Order required',
          description: 'Select an order to pay for (dev: seed mock orders first).',
          variant: 'destructive',
        });
        return;
      }

      // Chapa-only: frontend sends ONLY order_id, receives ONLY checkout_url.
      const { checkout_url } = await initiatePayment(orderId);

      // Redirect to Chapa checkout. Actual payment truth is established by
      // backend verification (webhook / verify endpoint).
      window.location.assign(checkout_url);

      setStepAndNavigate('confirmation');
      onOrderComplete();
    } catch (error: any) {
      console.error('Error initiating Chapa payment:', error);
      toast({
        title: 'Payment initiation failed',
        description: error?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceedToPayment = () => {
    if (user && selectedAddressId) return true;
    return (
      shippingForm.full_name &&
      shippingForm.address_line1 &&
      shippingForm.city &&
      shippingForm.state_province &&
      shippingForm.postal_code &&
      shippingForm.country &&
      shippingForm.phone
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="checkout-modal">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-950 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {step !== 'confirmation' && (
                <button
                  onClick={() => {
                    // Signed-in users should not be navigated back to the auth screen.
                    setStepAndNavigate(step === 'payment' ? 'shipping' : 'payment');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                {step === 'shipping' && 'Shipping Address'}
                {step === 'payment' && 'Payment'}
                {step === 'confirmation' && 'Redirecting to Payment'}
              </h2>
            </div>

            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Stepper */}
          <div className="mt-4">
            {(() => {
              const steps: Array<{ id: Step; label: string }> = [
                { id: 'shipping', label: 'Shipping' },
                { id: 'payment', label: 'Payment' },
                { id: 'confirmation', label: 'Status' },
              ];
              const currentIndex = steps.findIndex((s) => s.id === step);
              return (
                <ol className="flex items-center gap-3 text-sm">
                  {steps.map((s, idx) => {
                    const done = currentIndex > idx;
                    const active = currentIndex === idx;
                    return (
                      <li key={s.id} className="flex items-center gap-3">
                        <div
                          className={
                            'h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ' +
                            (done
                              ? 'bg-indigo-600 text-white'
                              : active
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-gray-100 text-gray-500')
                          }
                        >
                          {idx + 1}
                        </div>
                        <span className={active ? 'font-semibold text-gray-900' : 'text-gray-600'}>{s.label}</span>
                        {idx < steps.length - 1 && <span className="text-gray-300">/</span>}
                      </li>
                    );
                  })}
                </ol>
              );
            })()}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(90vh-140px)]">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-h-[50vh] lg:max-h-full">
            {/* Shipping Step */}
            {step === 'shipping' && (
              <div>
                {/* Saved Addresses (for logged in users) */}
                {user && addresses.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Saved Addresses</h3>
                    <div className="space-y-3">
                      {addresses.map((address) => (
                        <label
                          key={address.id}
                          className={`block p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                            selectedAddressId === address.id
                              ? 'border-indigo-600 bg-indigo-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="address"
                              checked={selectedAddressId === address.id}
                              onChange={() => setSelectedAddressId(address.id)}
                              className="mt-1"
                            />
                            <div>
                              <div className="font-medium text-gray-900">{address.full_name}</div>
                              <div className="text-sm text-gray-600">
                                {address.address_line1}, {address.city}, {address.state_province} {address.postal_code}
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>

                    <button
                      onClick={() => setSelectedAddressId('')}
                      className="mt-3 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      + Use a different address
                    </button>
                  </div>
                )}

                {/* New Address Form */}
                {(!user || !selectedAddressId) && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      {user ? 'New Address' : 'Shipping Address'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={shippingForm.full_name}
                          onChange={(e) => setShippingForm({ ...shippingForm, full_name: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                          type="text"
                          value={shippingForm.address_line1}
                          onChange={(e) => setShippingForm({ ...shippingForm, address_line1: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Apt, Suite, etc. (Optional)</label>
                        <input
                          type="text"
                          value={shippingForm.address_line2}
                          onChange={(e) => setShippingForm({ ...shippingForm, address_line2: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <select
                          value={shippingForm.city}
                          onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select sub city</option>
                          <option value="Addis Ketema">Addis Ketema</option>
                          <option value="Akaky Kaliti">Akaky Kaliti</option>
                          <option value="Arada">Arada</option>
                          <option value="Bole">Bole</option>
                          <option value="Gulele">Gulele</option>
                          <option value="Kirkos">Kirkos</option>
                          <option value="Kolfe Keraniyo">Kolfe Keraniyo</option>
                          <option value="Lideta">Lideta</option>
                          <option value="Nifas Silk-Lafto">Nifas Silk-Lafto</option>
                          <option value="Yeka">Yeka</option>
                          <option value="Lemi Kura">Lemi Kura</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Province/State</label>
                        <select
                          value={shippingForm.state_province}
                          onChange={(e) => setShippingForm({ ...shippingForm, state_province: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select province/state</option>
                          <option value="Addis Ababa">Addis Ababa</option>
                          <option value="Afar">Afar</option>
                          <option value="Amhara">Amhara</option>
                          <option value="Benishangul-Gumuz">Benishangul-Gumuz</option>
                          <option value="Dire Dawa">Dire Dawa</option>
                          <option value="Gambela">Gambela</option>
                          <option value="Harari">Harari</option>
                          <option value="Oromia">Oromia</option>
                          <option value="Sidama">Sidama</option>
                          <option value="Somali">Somali</option>
                          <option value="Southwest Ethiopia">Southwest Ethiopia</option>
                          <option value="Tigray">Tigray</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                        <input
                          type="text"
                          value={shippingForm.postal_code}
                          onChange={(e) => setShippingForm({ ...shippingForm, postal_code: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        <select
                          value={shippingForm.country}
                          onChange={(e) => setShippingForm({ ...shippingForm, country: e.target.value })}
                          required
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select country</option>
                          <option value="Ethiopia">Ethiopia</option>
                          <option value="Canada">Canada</option>
                          <option value="United States">United States</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={shippingForm.phone}
                          onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                          required
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setStepAndNavigate('payment')}
                  disabled={!canProceedToPayment()}
                  className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none transition-all"
                >
                  Continue to Payment
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Payment Step */}
            {step === 'payment' && (
              <div>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
                  <p className="text-amber-800 text-sm">
                    <strong>Backend-authoritative payments:</strong> This checkout will redirect you to the payment provider. Payment success is determined by the backend.
                  </p>
                </div>

                <h3 className="font-semibold text-gray-900 mb-3">Payment</h3>

                {!user && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 mb-4">
                    <div className="font-semibold text-gray-900">Sign in to pay</div>
                    <div className="text-sm text-gray-600 mt-1">
                      You can review shipping and totals as a guest, but youll need to sign in to initiate payment.
                    </div>
                    <button
                      type="button"
                      onClick={onSignInClick}
                      className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold"
                    >
                      Sign in to continue
                    </button>
                  </div>
                )}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-amber-900">Development Mode</div>
                      <div className="text-xs text-amber-800 mt-1">
                        This environment requires selecting an existing order to initiate payment.
                      </div>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-amber-200/60 px-2.5 py-1 text-xs font-semibold text-amber-900">
                      DEV
                    </span>
                  </div>

                  <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">Select Order</label>
                  <select
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    disabled={!user}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="">Select an order to pay for</option>
                    {payableOrders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.id.slice(0, 8)}… — {o.metadata?.amount ?? '—'} {o.metadata?.currency ?? ''}{o.is_mock ? ' (MOCK)' : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-amber-800 mt-2">
                    Only orders in CREATED status are eligible.
                  </p>
                  {user && payableOrders.length === 0 && (
                    <div className="mt-3 rounded-lg bg-white/60 dark:bg-white/5 border border-amber-200 dark:border-amber-800 p-3">
                      <div className="text-xs font-semibold text-amber-900">No payable orders found</div>
                      <div className="text-xs text-amber-800 mt-1">
                        This is a development-only workflow. Seed mock orders first (or create an order) to test payment initiation.
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Payment provider selection ─────────────────────────── */}
                <h3 className="font-semibold text-gray-900 mb-3">Choose Payment Method</h3>

                {/* Chapa */}
                <div className="bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-3">
                  <p className="text-sm text-gray-700 mb-3">
                    Pay via <strong>{PAYMENT_PROVIDER_NAME}</strong> — you will be redirected to complete payment securely.
                  </p>
                  <button
                    id="chapa-pay-btn"
                    onClick={handlePlaceOrder}
                    disabled={!user || loading || telebirrLoading || !orderId}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none transition-all"
                  >
                    {loading ? (
                      <TextSpinner label="Processing..." />
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Pay with {PAYMENT_PROVIDER_NAME} — {formatMoney(total, CHECKOUT_CURRENCY)}
                      </>
                    )}
                  </button>
                </div>

                {/* Telebirr C2B */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                  <p className="text-sm text-gray-700 mb-3">
                    Pay via <strong>Telebirr</strong> — you will be redirected to the Telebirr checkout page.
                  </p>
                  {telebirrError && (
                    <p className="text-xs text-red-600 mb-2">{telebirrError}</p>
                  )}
                  <button
                    id="telebirr-pay-btn"
                    onClick={initiateTelebirr}
                    disabled={!user || loading || telebirrLoading || !orderId}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none transition-all"
                  >
                    {telebirrLoading ? (
                      <TextSpinner label="Redirecting…" />
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Pay with Telebirr — {formatMoney(total, CHECKOUT_CURRENCY)}
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-4 flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" />
                  Secure checkout (payment handled by provider)
                </p>
              </div>
            )}

            {/* Confirmation Step */}
            {step === 'confirmation' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TextSpinner label="Redirecting..." />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Redirecting to payment...</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  If you are not redirected automatically, please try again.
                </p>
                <div className="bg-gray-50 dark:bg-gray-900/60 rounded-xl p-6 max-w-sm mx-auto mb-6">
                  <div className="text-sm text-gray-500 mb-1">Order ID</div>
                  <div className="text-xs font-mono text-gray-900 break-all">{orderId}</div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                  Payment status will be confirmed by the backend after the provider completes processing.
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                  <a
                    href="/payment-status"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold text-center"
                  >
                    View Payment Status
                  </a>
                  <button
                    onClick={onClose}
                    className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 px-6 sm:px-8 py-3 rounded-xl font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          {step !== 'confirmation' && (
            <div className="w-full lg:w-80 bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-800 overflow-y-auto max-h-[40vh] lg:max-h-full">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>

              <BestOfferNotice
                show={cartItems.some((i) => (i.product.offers?.length ?? 0) > 1)}
                className="mb-4"
              />
              
              {/* Items */}
              <div className="space-y-3 mb-4 max-h-32 lg:max-h-48 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.lineId} className="flex gap-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-14 h-14 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Qty: {item.quantity}
                        {item.giftWrap && ' • Gift Wrapped'}
                      </div>
                      <SellerMeta
                        item={item}
                        onChangeSeller={onChangeSeller}
                        className="text-[11px] text-gray-500 dark:text-gray-400"
                      />
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatMoney((item.selectedOffer?.price ?? item.product.price) * item.quantity, item.selectedOffer?.currency ?? item.product.currency)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-900 dark:text-white">{formatMoney(subtotal, CHECKOUT_CURRENCY)}</span>
                </div>
                {giftWrapTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Gift Wrapping</span>
                    <span className="text-gray-900 dark:text-white">{formatMoney(giftWrapTotal, CHECKOUT_CURRENCY)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span className="text-gray-900 dark:text-white">{shipping === 0 ? 'FREE' : formatMoney(shipping, CHECKOUT_CURRENCY)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tax ({Math.round(TAX_RATE * 100)}%)</span>
                  <span className="text-gray-900 dark:text-white">{formatMoney(tax, CHECKOUT_CURRENCY)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="dark:text-white">Total</span>
                  <span className="dark:text-white">{formatMoney(total, CHECKOUT_CURRENCY)}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <Truck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Free shipping on orders {CHECKOUT_CURRENCY} {SHIPPING_FREE_THRESHOLD}+</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <Gift className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Gift wrapping available</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Secure checkout</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
