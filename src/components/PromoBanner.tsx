import React from 'react';
import { Gift, Sparkles, ArrowRight } from 'lucide-react';

interface PromoBannerProps {
  onShopGifts: () => void;
}

const PromoBanner: React.FC<PromoBannerProps> = ({ onShopGifts }) => {
  return (
    <section className="py-12 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Content */}
          <div className="flex items-center gap-4 text-white">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Gift className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-sm font-medium text-pink-100">Holiday Special</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold">
                Free Gift Wrapping on All Orders
              </h3>
              <p className="text-pink-100 mt-1">
                Plus 20% off when you spend $100+ | Use code: HOLIDAY20
              </p>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={onShopGifts}
            className="bg-white hover:bg-gray-100 text-purple-600 px-8 py-4 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl whitespace-nowrap"
          >
            Shop Gift Guide
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
