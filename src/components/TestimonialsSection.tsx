import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const TestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: 'Sarah M.',
      location: 'Toronto, ON',
      avatar: 'SM',
      rating: 5,
      title: 'Finally, a store I can trust!',
      text: 'As a first-time mom, I was overwhelmed by all the choices out there. DEKNA made it so easy to find safe, quality products. The safety certifications on every product give me such peace of mind.',
      product: 'Organic Cotton Onesie Set'
    },
    {
      id: 2,
      name: 'Michael R.',
      location: 'Vancouver, BC',
      avatar: 'MR',
      rating: 5,
      title: 'Perfect for gift shopping',
      text: 'I always struggle with what to buy for my nieces and nephews. The gift guide feature and gift wrapping option made it so simple. The quality exceeded my expectations!',
      product: 'Rainbow Stacking Tower'
    },
    {
      id: 3,
      name: 'Jennifer L.',
      location: 'Calgary, AB',
      avatar: 'JL',
      rating: 5,
      title: 'Subscription is a lifesaver',
      text: 'The subscription service for diapers and wipes has been amazing. Never running out, great prices, and I love that they use eco-friendly products. Highly recommend!',
      product: 'Eco Diaper Subscription'
    },
    {
      id: 4,
      name: 'David & Emma K.',
      location: 'Montreal, QC',
      avatar: 'DK',
      rating: 5,
      title: 'Worth every penny',
      text: 'We bought the Urban Explorer Stroller and it\'s been incredible. The quality is outstanding, and the customer service team was so helpful with our questions.',
      product: 'Urban Explorer Stroller'
    }
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 via-purple-50/50 to-pink-50 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-pink-950/30 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/20 dark:bg-purple-800/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200/20 dark:bg-indigo-800/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-widest mb-4 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
            Customer Love
          </span>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-6 tracking-tight">
            What Parents Are Saying
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Join thousands of happy families who trust DEKNA for their kids' essentials
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Main Card */}
          <div className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm rounded-3xl shadow-2xl p-10 md:p-14 border border-gray-100 dark:border-gray-800">
            <Quote className="w-14 h-14 text-indigo-200 dark:text-indigo-800 mb-8" />
            
            {/* Rating */}
            <div className="flex items-center gap-1.5 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 ${
                    i < testimonials[currentIndex].rating
                      ? 'text-amber-400 fill-current'
                      : 'text-gray-300 dark:text-gray-700'
                  }`}
                />
              ))}
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              "{testimonials[currentIndex].title}"
            </h3>

            {/* Text */}
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-8">
              {testimonials[currentIndex].text}
            </p>

            {/* Product */}
            <div className="inline-block bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-full text-sm font-semibold mb-8 border border-indigo-100 dark:border-indigo-800">
              Purchased: {testimonials[currentIndex].product}
            </div>

            {/* Author */}
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {testimonials[currentIndex].avatar}
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-white text-lg">
                  {testimonials[currentIndex].name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {testimonials[currentIndex].location}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-6 mt-10">
            <button
              onClick={prevTestimonial}
              className="w-14 h-14 bg-white dark:bg-gray-950 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 border border-gray-200 dark:border-gray-800 hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            </button>
            
            {/* Dots */}
            <div className="flex gap-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'w-10 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400'
                      : 'w-3 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={nextTestimonial}
              className="w-14 h-14 bg-white dark:bg-gray-950 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 border border-gray-200 dark:border-gray-800 hover:scale-110"
            >
              <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">50K+</div>
            <div className="text-gray-600 dark:text-gray-300 font-medium">Happy Families</div>
          </div>
          <div className="text-center p-6 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">4.9</div>
            <div className="text-gray-600 dark:text-gray-300 font-medium">Average Rating</div>
          </div>
          <div className="text-center p-6 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">98%</div>
            <div className="text-gray-600 dark:text-gray-300 font-medium">Would Recommend</div>
          </div>
          <div className="text-center p-6 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">2K+</div>
            <div className="text-gray-600 dark:text-gray-300 font-medium">5-Star Reviews</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
