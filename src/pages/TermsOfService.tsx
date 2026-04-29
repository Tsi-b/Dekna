import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Shield, CreditCard } from "lucide-react";

import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
function TermsOfServiceContent() {
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
        title="Terms of Service"
        description="Read DEKNA's terms of service, user agreements, and policies for shopping kids products online."
        keywords="terms of service, user agreement, dekna terms, policies"
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header {...headerProps} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Page Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">Terms of service</h1>
          <div className="h-1 w-20 bg-indigo-600 rounded-full"></div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 sm:space-y-8">
          {/* Main Terms */}
          <section className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Service Terms
                </h2>
              </div>
            </div>
            
            <ol className="space-y-4">
              {[
                'Orders usually take 2 to 3 working days within Addis Ababa, but may take longer if items aren\'t available in the nearest branch.',
                'Orders outside Addis Ababa may take longer.',
                'Due to increasing demand on some products, we may receive many orders from different channels (in stores, through the website, and social media). Sometimes the requested item becomes out of stock. In this case, we offer our clients alternatives or an immediate refund.',
                'With all respect and care for our customers, please note that our employees and managers work beyond their capacity in an unprecedented time to answer your inquiries and orders. Therefore, we would like to inform you that it is totally unacceptable to offend or insult anyone on our team, whatever the reason.',
                'Exchange and refund can be done only in stores within 14 days with the receipt, and the product must be in its original condition.',
                'Pools, Inflatables, Hair Brushes, Puzzles, Bottles, Pumps, Clothes, Accessories And Any Other Hygienic Products Cannot Be Exchanged Or Refunded After Opening The Box.',
                'Refund will be made in the form of the original payment method.',
                'Gifts can only be exchanged with the gift receipt.'
              ].map((term, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 leading-relaxed pt-0.5">{term}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Legal Notes */}
          <section className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Notes
                </h2>
              </div>
            </div>
            
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1">•</span>
                <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Any dispute or claim arising out of or in connection with this website shall be governed and construed in accordance with the laws of Ethiopia.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1">•</span>
                <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  If you make a payment for our products or services on our website, the details you are asked to submit will be provided directly to our payment provider via a secured connection.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1">•</span>
                <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  The cardholder must retain a copy of transaction records and Merchant policies and rules.
                </span>
              </li>
            </ul>
          </section>

          {/* Payment Security Notice */}
          <section className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl shadow-sm border border-green-200 dark:border-green-900 p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Secure Payment Processing
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  All payment information is transmitted through secure, encrypted connections. Your financial data is handled directly by our certified payment providers and is never stored on our servers.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
    </>
  );
}

export default function TermsOfService() {
  return <TermsOfServiceContent />;
}
