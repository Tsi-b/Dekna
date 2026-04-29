import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Smartphone, Zap, Bell, ShoppingBag, Star } from "lucide-react";

import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
function AppDownloadContent() {
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

  const features = [
    {
      icon: Zap,
      title: "Faster Shopping",
      description: "Browse and checkout in seconds with our optimized mobile experience"
    },
    {
      icon: Star,
      title: "Exclusive Deals",
      description: "Get access to app-only discounts and special offers"
    },
    {
      icon: Bell,
      title: "Order Tracking",
      description: "Real-time notifications and easy order tracking at your fingertips"
    },
    {
      icon: ShoppingBag,
      title: "Quick Reorder",
      description: "Reorder your favorite items with just one tap"
    }
  ];

  return (
    <>
      <SEO
        title="Download App"
        description="Download the DEKNA mobile app for faster shopping, exclusive deals, and personalized recommendations for kids products."
        keywords="dekna app, mobile app, download app, kids shopping app"
      />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950/30 dark:to-purple-950/30">
        <Header {...headerProps} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl mb-6 shadow-lg">
            <Smartphone className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            App Download
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto mb-10">
            Download the DEKNA app for a faster shopping experience, exclusive deals, and easier order tracking.
          </p>

          {/* Download Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a
              href="#"
              className="group inline-flex items-center justify-center rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-5 text-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              aria-label="Download on the App Store"
            >
              <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div className="text-left">
                <div className="text-xs opacity-80">Download on the</div>
                <div className="text-xl font-bold">App Store</div>
              </div>
            </a>
            
            <a
              href="#"
              className="group inline-flex items-center justify-center rounded-2xl border-2 border-gray-900 dark:border-white bg-transparent text-gray-900 dark:text-white px-8 py-5 text-lg font-semibold hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              aria-label="Get it on Google Play"
            >
              <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
              </svg>
              <div className="text-left">
                <div className="text-xs opacity-80">GET IT ON</div>
                <div className="text-xl font-bold">Google Play</div>
              </div>
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl mb-4">
            <Smartphone className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Coming Soon
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Our mobile app is currently in development. Sign up for notifications to be the first to know when it launches!
          </p>
        </div>
      </main>

      <Footer />
    </div>
    </>
  );
}

export default function AppDownload() {
  return <AppDownloadContent />;
}
