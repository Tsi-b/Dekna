import React from 'react';
import { CartItem } from '@/types';
import { X, Plus, Minus, Trash2, Gift, ShoppingBag, ArrowRight } from 'lucide-react';
import { formatMoney } from '@/lib/money';
import {
  CHECKOUT_CURRENCY,
  GIFT_WRAP_FEE,
  PAYMENT_PROVIDER_NAME,
  SHIPPING_FEE,
  SHIPPING_FREE_THRESHOLD,
} from '@/lib/checkout_constants';
import SellerMeta from '@/components/SellerMeta';
import BestOfferNotice from '@/components/BestOfferNotice';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (lineId: string, quantity: number) => void;
  onRemoveItem: (lineId: string) => void;
  onToggleGiftWrap: (lineId: string) => void;
  onCheckout: () => void;
  onChangeSeller: (productId: string, offerId?: string) => void;
}


const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onToggleGiftWrap,
  onCheckout,
  onChangeSeller,
}) => {

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.selectedOffer?.price ?? item.product.price) * item.quantity,
    0
  );
  const giftWrapTotal = cartItems.filter(item => item.giftWrap).length * GIFT_WRAP_FEE;
  const shipping = subtotal > SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + giftWrapTotal + shipping;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" data-testid="cart-modal">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 min-w-0">
            <ShoppingBag className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900 truncate">Your Cart</h2>
            <span className="bg-indigo-100 text-indigo-600 text-sm font-semibold px-2.5 py-0.5 rounded-full">
              {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-20 h-20 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-500 mb-6">Add some products to get started!</p>
              <button
                onClick={onClose}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-2 border-indigo-200 px-8 py-3 rounded-xl font-semibold"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.lineId}
                  className="bg-gray-50 rounded-xl p-4 space-y-3 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex gap-4">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 line-clamp-2">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {item.selectedSize && `Size: ${item.selectedSize}`}
                        {item.selectedColor && ` • ${item.selectedColor}`}
                      </p>
                      <p className="text-indigo-600 font-semibold mt-1">
                        {formatMoney(item.selectedOffer?.price ?? item.product.price, item.selectedOffer?.currency ?? item.product.currency)}
                      </p>
                      <SellerMeta
                        item={item}
                        onChangeSeller={onChangeSeller}
                        className="text-xs text-gray-500 mt-1"
                      />
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.lineId)}
                      className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors self-start"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center bg-white rounded-lg border border-gray-200">
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.lineId, item.quantity - 1)
                        }
                        className="p-2 hover:bg-gray-100 transition-colors rounded-l-lg"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="px-4 py-2 font-medium text-gray-900 min-w-[40px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.lineId, item.quantity + 1)
                        }
                        className="p-2 hover:bg-gray-100 transition-colors rounded-r-lg"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>

                    {/* Gift Wrap Toggle */}
                    <button
                      onClick={() => onToggleGiftWrap(item.lineId)}
                      className={`w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        item.giftWrap
                          ? 'bg-pink-100 text-pink-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Gift className="w-4 h-4" />
                      {item.giftWrap ? 'Gift Wrapped' : 'Add Gift Wrap'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-100 p-4 sm:p-6 space-y-4 bg-gray-50">
            {/* Free Shipping Progress */}
            {subtotal < SHIPPING_FREE_THRESHOLD && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                <p className="text-sm text-amber-800">
                  Add <span className="font-semibold">{formatMoney(SHIPPING_FREE_THRESHOLD - subtotal, CHECKOUT_CURRENCY)}</span> more for FREE shipping!
                </p>
                <div className="mt-2 h-2 bg-amber-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((subtotal / SHIPPING_FREE_THRESHOLD) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            <BestOfferNotice
              show={cartItems.some((i) => (i.product.offers?.length ?? 0) > 1)}
              className="mb-3"
              helperText="We automatically pick the best offer based on price, delivery speed, and seller rating. You can compare other sellers from the product view."
            />

            {/* Summary */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal, CHECKOUT_CURRENCY)}</span>
              </div>
              {giftWrapTotal > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Gift Wrapping</span>
                  <span>{formatMoney(giftWrapTotal, CHECKOUT_CURRENCY)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : formatMoney(shipping, CHECKOUT_CURRENCY)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>{formatMoney(total, CHECKOUT_CURRENCY)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button 
              data-testid="cart-proceed-checkout"
              onClick={onCheckout}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5" />
            </button>


            <p className="text-xs text-gray-500 text-center">
              Secure checkout powered by {PAYMENT_PROVIDER_NAME}. 60-day returns.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
