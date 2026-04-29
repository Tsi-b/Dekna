import React from 'react';
import { categories } from '@/data/products';

interface CategorySectionProps {
  onCategorySelect: (categoryId: string) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({ onCategorySelect }) => {
  return (
    <section className="py-20 bg-gradient-to-b from-white via-indigo-50/30 to-white dark:from-gray-950 dark:via-indigo-950/10 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="section-title mb-6">
            Shop by Category
          </h2>
          <p className="section-subtitle">
            Explore our curated collections for every stage of childhood
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <div key={category.id} className="flex flex-col items-center gap-4">
              <button
                onClick={() => onCategorySelect(category.id)}
                className="group relative overflow-hidden rounded-full aspect-square text-center transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl shadow-lg flex items-center justify-center w-full"
              >
                {/* Background Image */}
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/40 to-transparent rounded-full" />
                
                {/* Content - Shop Now */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <span className="text-white text-xs md:text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Shop Now →
                  </span>
                </div>
              </button>
              
              {/* Category Name Link */}
              <button
                onClick={() => onCategorySelect(category.id)}
                className="text-[#B8860B] hover:text-[#DAA520] dark:text-[#C9A96E] dark:hover:text-[#E5C58A] text-lg md:text-xl font-semibold tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:drop-shadow-[0_0_8px_rgba(184,134,11,0.4)] dark:hover:drop-shadow-[0_0_8px_rgba(201,169,110,0.4)] no-underline text-center"
              >
                {category.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
