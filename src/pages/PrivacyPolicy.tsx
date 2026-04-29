import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
function PrivacyPolicyContent() {
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
        title="Privacy Policy"
        description="Read DEKNA's privacy policy to understand how we collect, use, and protect your personal information."
        keywords="privacy policy, data protection, dekna privacy, user privacy"
      />
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Header {...headerProps} />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">Privacy Policy</h1>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p>
            Privacy Policy content will be published here.
          </p>
        </div>
      </main>
      <Footer />
    </div>
    </>
  );
}

export default function PrivacyPolicy() {
  return <PrivacyPolicyContent />;
}
