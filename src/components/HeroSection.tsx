import React from 'react';
import { ArrowRight, Shield, Leaf, Award } from 'lucide-react';
import { heroImage } from '@/data/products';

interface HeroSectionProps {
  onShopNow: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onShopNow }) => {
  return (
    <section className="relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Happy family with kids"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 via-indigo-900/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-32">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-6">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium">Trusted by 50,000+ Parents</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-6 leading-tight">
            Thoughtful, Sustainable
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
              Kids' Essentials
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-indigo-100 mb-8 leading-relaxed">
            Curated collection of clothing, toys, and gear for ages 0-8.
            Designed for everyday comfort and play.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <button
              onClick={onShopNow}
              className="bg-white hover:bg-gray-100 text-indigo-900 px-8 py-5 sm:py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
            >
              Shop Now
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg border border-white/30 transition-all hover:border-white/50">
              View Gift Guide
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2 text-white/90">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="font-semibold text-sm">Quality Picks</div>
                <div className="text-xs text-white/60">Parent Approved</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="font-semibold text-sm">Eco-Friendly</div>
                <div className="text-xs text-white/60">Sustainable Materials</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-sm">60-Day Returns</div>
                <div className="text-xs text-white/60">No Questions Asked</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
};

export default HeroSection;
