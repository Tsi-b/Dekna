import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
function AboutUsContent() {
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
        title="About Us"
        description="Learn about DEKNA Kids Goods Shop - your trusted source for premium children's products, toys, books, and essentials."
        keywords="about dekna, kids store, children products, about us"
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header {...headerProps} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Page Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">About Us</h1>
          <div className="h-1 w-20 bg-indigo-600 rounded-full"></div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 sm:space-y-10">
          {/* Message Section */}
          <section className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              A Message To DEKNA Parents
            </h2>
            
            <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                DEKNA... A place every parent belongs to
              </p>
              
              <p>
                Founded in 2018 E.C, we put parents' comfort and care first. We strive to meet your expectations by providing daily child care essentials and necessities in one convenient place—making parenting simpler and more enjoyable.
              </p>
            </div>
          </section>

          {/* What We Offer Section */}
          <section className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              What do we offer?
            </h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-indigo-600 pl-4 sm:pl-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Necessities</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  DEKNA offers a wide array of products that serve parents from day one—baby essentials, feeding supplies, nursery furniture, strollers, car seats, and much more.
                </p>
              </div>
              
              <div className="border-l-4 border-purple-600 pl-4 sm:pl-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Clothing</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Keep your kids' wardrobe trendy with affordable prices and comfortable designs. We provide unique fashion for newborns to 12 years.
                </p>
              </div>
              
              <div className="border-l-4 border-pink-600 pl-4 sm:pl-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Toys</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  There's a special toy for every kid at any age with a reasonable price that fits every budget—from toddlers' toys and dolls to games &amp; puzzles, scooters, bikes, and vehicles.
                </p>
              </div>
            </div>
          </section>

          {/* Home of Happiness Section */}
          <section className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-900 p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Home of happiness
            </h2>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We believe DEKNA is the place every parent can count on when it comes to child care essentials and necessities under one roof.
            </p>
            
            <div className="bg-white/60 dark:bg-gray-950/40 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Our Locations:</p>
              <div className="flex flex-wrap gap-2">
                {['Dokki', 'Nasr City', 'Fifth Settlement', 'October', 'Sheikh Zayed'].map((location) => (
                  <span key={location} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                    {location}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Easier Parenting Section */}
          <section className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              We are here to make your parenting life easier
            </h2>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              To fulfill and meet parents' needs, we've made every effort to maximize value and convenience. Enjoy a hassle-free, easy-to-navigate shopping experience—shop your favorite things with ease through our website and get them delivered to your doorstep.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
    </>
  );
}

export default function AboutUs() {
  return <AboutUsContent />;
}
