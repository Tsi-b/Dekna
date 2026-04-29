
import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import RouteTitleManager from "@/components/RouteTitleManager";
import ScrollToTop from "@/components/ScrollToTop";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const PaymentStatus = lazy(() => import("./pages/PaymentStatus"));
const MockTelebirrPayment = lazy(() => import("./pages/MockTelebirrPayment"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const AppDownload = lazy(() => import("./pages/AppDownload"));
const ReturnsRefunds = lazy(() => import("./pages/ReturnsRefunds"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

const App = () => (
  <HelmetProvider>
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <AuthProvider>
            <AppProvider>
              <BrowserRouter>
                <ScrollToTop />
                <RouteTitleManager />
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Storefront routes (Index owns the layout + modals) */}
                    <Route path="/" element={<Index />} />
                    {/* Back-compat alias */}
                    <Route path="/accounts/addresses" element={<Navigate to="/account/addresses" replace />} />
                    <Route path="/cart" element={<Index />} />
                    <Route path="/auth" element={<Index />} />
                    <Route path="/account" element={<Index />} />
                    <Route path="/account/:tab" element={<Index />} />
                    <Route path="/checkout" element={<Index />} />
                    <Route path="/checkout/:step" element={<Index />} />
                    <Route path="/collections" element={<Navigate to="/collections/all" replace />} />
                    <Route path="/collections/" element={<Navigate to="/collections/all" replace />} />
                    <Route path="/collections/:category" element={<Index />} />
                    <Route path="/books" element={<Navigate to="/collections/books" replace />} />
                    <Route path="/toys" element={<Navigate to="/collections/toys" replace />} />
                    <Route path="/gifts" element={<Navigate to="/collections/gifts" replace />} />

                    {/* Dedicated pages */}
                    <Route path="/payment-status" element={<PaymentStatus />} />
                    <Route path="/mock-telebirr-payment" element={<MockTelebirrPayment />} />
                    <Route path="/about-us" element={<AboutUs />} />
                    <Route path="/refund-policy" element={<RefundPolicy />} />
                    <Route path="/terms-of-service" element={<TermsOfService />} />
                    <Route path="/app-download" element={<AppDownload />} />
                    <Route path="/search" element={<Index />} />
                    <Route path="/returns-refunds" element={<ReturnsRefunds />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </AppProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </HelmetProvider>
);

export default App;
