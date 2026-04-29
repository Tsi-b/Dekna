import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Clock, RefreshCw, AlertCircle, CheckCircle, XCircle } from "lucide-react";

import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
function RefundPolicyContent() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const headerProps = useMemo(
    () => ({
      cartItemCount: 0,
      wishlistCount: 0,
      onCartClick: () => navigate("/cart"),
      onWishlistClick: () => navigate("/account/wishlist"),
      searchQuery,
      onSearchChange: (q: string) => setSearchQuery(q),
      showSearchButton: true,
      onSearchSubmit: () => {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set("q", searchQuery.trim());
        navigate({ pathname: "/search", search: params.toString() ? `?${params.toString()}` : "" });
      },
      onCategorySelect: (category: string) => {
        if (category === "all") {
          navigate("/collections/all");
          return;
        }
        navigate(`/collections/${category}`);
      },
      onAuthClick: () => navigate("/auth"),
      onAccountClick: () => navigate("/account"),
    }),
    [navigate, searchQuery]
  );

  return (
    <>
      <SEO
        title="Refund Policy"
        description="Learn about DEKNA's refund policy, return process, and eligibility criteria for kids products."
        keywords="refund policy, returns, dekna refund, return policy"
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header {...headerProps} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Page Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">Refund policy</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Frequently asked questions about returns, refunds, and exchanges.
          </p>
          <div className="h-1 w-20 bg-indigo-600 rounded-full mt-4"></div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 sm:space-y-8">
          {/* How to Return */}
          <section className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  How do I return an item(s)?
                </h2>
              </div>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Visit our returns center by clicking the profile icon in the store's navigation, or go to the refund policy or returns page, then request a return.
            </p>
            
            <ol className="space-y-3">
              {[
                'Log in to your account. In the Email field, enter your email address and click Continue.',
                'In your email account, open the email sent from our store and copy the six-digit verification code.',
                'Return to the online store and enter the six-digit verification code.',
                'Click the order you want to submit the return for.',
                'If your order has more than one item, select the items you want to return.',
                'Select a return reason and add a note for the store.',
                'Click Request return. If your return request is approved and requires shipping, you\'ll receive an email with shipping instructions and a return shipping label. After the product is returned, you\'ll receive a refund.'
              ].map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 leading-relaxed pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Returnable Items */}
          <section className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  What items are returnable?
                </h2>
              </div>
            </div>
            
            <ul className="space-y-2">
              {[
                'Within 14 days from the date of purchase',
                'In unused and resellable condition',
                'In the original packaging with all tags intact',
                'Only items purchased from DEKNA matching the above conditions. The buyer must present the payment receipt or receiving receipt proving the item was bought from DEKNA, and the item must have the DEKNA barcode sticker on the package.'
              ].map((item, index) => (
                <li key={index} className="flex gap-3">
                  <span className="text-green-600 dark:text-green-400 flex-shrink-0 mt-1">✓</span>
                  <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Non-Refundable Items */}
          <section className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  What items are non-refundable?
                </h2>
              </div>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              The following items cannot be returned:
            </p>
            
            <ul className="space-y-2">
              {[
                'Gift cards',
                'Discounted items (if applicable)',
                'Underwear, Costumes, Perfumes, Pools, Inflatables, Hair Brushes, Puzzles, Bottles, Pumps, Accessories And Any Other Hygienic Products Cannot Be Exchanged Or Refunded After Opening The Box.',
                'No refund for delivery service.'
              ].map((item, index) => (
                <li key={index} className="flex gap-3">
                  <span className="text-red-600 dark:text-red-400 flex-shrink-0 mt-1">✗</span>
                  <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Damaged Items */}
          <section className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl shadow-sm border border-amber-200 dark:border-amber-900 p-6 sm:p-8">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  The item I received is damaged!
                </h2>
              </div>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              If the purchased product is faulty, reach out to us within 7 days of the delivered date.
            </p>
          </section>

          {/* Exchange */}
          <section className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Can the items be exchanged?
                </h2>
              </div>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We allow the exchange of purchased items for selectable variants. Once the exchange request is approved, the replaced item will be shipped to you.
            </p>
          </section>

          {/* Refund Options */}
          <section className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              What are the refund options?
            </h2>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              The following refund options are supported:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-900/60 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                <p className="text-gray-700 dark:text-gray-300">Refund to the original payment method</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/60 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                <p className="text-gray-700 dark:text-gray-300">Refund to store credit (if applicable)</p>
              </div>
            </div>
          </section>

          {/* Shipping Back */}
          <section className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              How do I ship back the items?
            </h2>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              For instructions on how to ship the returned products, refer to the email received after placing the return request.
            </p>
          </section>

          {/* Refund Timeline */}
          <section className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  How soon will I get my refund?
                </h2>
              </div>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Once your returned item is received and inspected, you'll be notified via email. You'll also be informed about the approval or rejection of your refund request. If approved, the refund will be processed within <span className="font-semibold text-indigo-600 dark:text-indigo-400">7 - 14 working days</span> after approval.
            </p>
          </section>

          {/* Cancel Order */}
          <section className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              How to cancel an order?
            </h2>
            
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                <span className="text-gray-700 dark:text-gray-300 leading-relaxed pt-0.5">
                  If you decide to cancel your order before it's shipped or delivered to the shipping company, only bank incurred fees will be deducted from the amount paid.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                <span className="text-gray-700 dark:text-gray-300 leading-relaxed pt-0.5">
                  If you decide to cancel your order after it was delivered to the shipping company or after it was shipped, you'll be responsible for the cost of returning the products (including any additional items sent with your product, such as free gifts or giveaways from DEKNA).
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </span>
                <span className="text-gray-700 dark:text-gray-300 leading-relaxed pt-0.5">
                  Refunds will be done only through the original mode of payment.
                </span>
              </li>
            </ol>
          </section>
        </div>
      </main>

      <Footer />
    </div>
    </>
  );
}

export default function RefundPolicy() {
  return <RefundPolicyContent />;
}
