import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
function ReturnsRefundsContent() {
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
        title="Returns & Refunds"
        description="Information about returns and refunds for DEKNA kids products. Learn about our return process and policies."
        keywords="returns, refunds, return policy, dekna returns"
      />
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Header {...headerProps} />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">Returns &amp; Refunds</h1>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p>
            Returns &amp; Refunds information will be published here.
          </p>
        </div>
      </main>
      <Footer />
    </div>
    </>
  );
}

export default function ReturnsRefunds() {
  return <ReturnsRefundsContent />;
}
