import React from 'react';

import { Link } from 'react-router-dom';

type Essential = {
  title: string;
  imageSrc: string;
  to: string;
};

const FeaturesSection: React.FC = () => {
  // Use a single, neutral image that works for all categories.
  // (Can be swapped for unique category images later.)
  const essentials: Essential[] = [
    {
      title: 'Books',
      to: '/books',
      imageSrc: 'https://i.pinimg.com/736x/3d/0a/31/3d0a316a90cc199b0cf78d3b0d1b295f.jpg',
    },
    {
      title: 'Travel',
      to: '/collections/travel-systems',
      imageSrc: 'https://i.pinimg.com/1200x/5c/3b/a1/5c3ba11e9b4a9d85210a1b88c74fc275.jpg',
    },
    {
      title: 'Bathing',
      to: '/collections/bathing-changing',
      imageSrc: 'https://i.pinimg.com/736x/a3/dd/11/a3dd115d24ace30c89eaf525997ef69b.jpg',
    },
    {
      title: 'Cribs',
      to: '/collections/cribs-beddings',
      imageSrc: 'https://i.pinimg.com/736x/a1/d3/20/a1d3201d70269c5b90ef21b9ba1e321b.jpg',
    },
    {
      title: 'Healthcare',
      to: '/collections/healthcare-safety',
      imageSrc: 'https://i.pinimg.com/1200x/66/3f/a5/663fa57fc16268c07ecff49f9f6daf6a.jpg',
    },
    {
      title: 'Walkers',
      to: '/collections/walkers-jumpers-swings',
      imageSrc: 'https://i.pinimg.com/736x/48/0d/22/480d221dd3a17e1cf01b37123a27d0d6.jpg',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50/50 via-white to-pink-50/50 dark:from-purple-950/20 dark:via-gray-950 dark:to-pink-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">New Essentials</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"></div>
        </div>

        {/* Essentials Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {essentials.map((item) => (
            <div key={item.title} className="flex flex-col items-center gap-4">
              <Link
                to={item.to}
                className="group relative overflow-hidden rounded-full aspect-square text-center transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl shadow-lg flex items-center justify-center w-full"
              >
                {/* Background Image */}
                <img
                  src={item.imageSrc}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  loading="lazy"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/40 to-transparent rounded-full" />

                {/* Content - Shop Now */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <span className="text-white text-xs md:text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Shop Now →
                  </span>
                </div>
              </Link>
              
              {/* Item Name Link */}
              <Link
                to={item.to}
                className="text-[#B8860B] hover:text-[#DAA520] dark:text-[#C9A96E] dark:hover:text-[#E5C58A] text-base md:text-lg font-semibold tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:drop-shadow-[0_0_8px_rgba(184,134,11,0.4)] dark:hover:drop-shadow-[0_0_8px_rgba(201,169,110,0.4)] no-underline text-center"
              >
                {item.title}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
