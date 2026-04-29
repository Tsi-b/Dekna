import React from 'react';
import { Baby, User, Users, ArrowRight } from 'lucide-react';

interface AgeGuideSectionProps {
  onAgeSelect: (ageRange: string) => void;
}

const AgeGuideSection: React.FC<AgeGuideSectionProps> = ({ onAgeSelect }) => {
  const ageGroups = [
    {
      icon: Baby,
      range: '0-12 months',
      title: 'Newborn & Infant',
      description: 'Gentle essentials for your newest family member',
      products: ['Onesies', 'Sleep suits', 'Soft toys', 'Carriers'],
      color: 'from-pink-400 to-rose-500'
    },
    {
      icon: Baby,
      range: '1-2 years',
      title: 'Toddler',
      description: 'Safe exploration for curious little ones',
      products: ['Stacking toys', 'First shoes', 'Sippy cups', 'Push toys'],
      color: 'from-amber-400 to-orange-500'
    },
    {
      icon: User,
      range: '3-5 years',
      title: 'Preschooler',
      description: 'Learning through play and creativity',
      products: ['Building sets', 'Art supplies', 'Dress-up', 'Bikes'],
      color: 'from-emerald-400 to-teal-500'
    },
    {
      icon: Users,
      range: '6-8 years',
      title: 'Big Kid',
      description: 'Growing independence and adventure',
      products: ['Board games', 'Sports gear', 'Books', 'Tech toys'],
      color: 'from-indigo-400 to-purple-500'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-emerald-50/50 via-teal-50/30 to-cyan-50/50 dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-cyan-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-widest mb-4 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
            Shop by Age
          </span>
          <h2 className="section-title mb-6">
            Find the Perfect Fit
          </h2>
          <p className="section-subtitle">
            Age-appropriate products curated by child development experts
          </p>
        </div>

        {/* Age Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {ageGroups.map((group, index) => (
            <button
              key={index}
              onClick={() => onAgeSelect(group.range)}
              className="group bg-white dark:bg-gray-950 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden text-left hover:scale-[1.03] border border-gray-100 dark:border-gray-800"
            >
              {/* Header */}
              <div className={`bg-gradient-to-br ${group.color} p-8`}>
                <div className="w-14 h-14 bg-white/25 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <group.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-white/90 text-sm font-semibold mb-2 uppercase tracking-wide">
                  {group.range}
                </div>
                <h3 className="text-2xl font-bold text-white">
                  {group.title}
                </h3>
              </div>

              {/* Content */}
              <div className="p-7">
                <p className="text-gray-600 dark:text-gray-300 mb-5 leading-relaxed">
                  {group.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {group.products.map((product, i) => (
                    <span
                      key={i}
                      className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-3 py-1.5 rounded-full font-medium"
                    >
                      {product}
                    </span>
                  ))}
                </div>
                <span className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold group-hover:gap-4 transition-all duration-300">
                  Shop Now
                  <ArrowRight className="w-5 h-5" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AgeGuideSection;
