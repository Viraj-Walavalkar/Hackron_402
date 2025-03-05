import React from 'react';

export const Hero = () => {
  return (
    <div className="relative bg-gradient-to-r from-green-500 to-green-600 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 flex flex-col md:flex-row items-center justify-between py-16">
        {/* Text Content */}
        <div className="text-white max-w-xl text-center md:text-left">
          <h1 className="text-5xl font-extrabold leading-tight mb-4">
            🚀 Delivery in 12 Minutes!
          </h1>
          <p className="text-lg opacity-90">
            Get your daily essentials delivered right to your doorstep, faster than ever.
          </p>
          <button className="mt-6 bg-white text-green-600 font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-gray-100 transition">
            Order Now
          </button>
        </div>

        {/* Image */}
        <div className="mt-8 md:mt-0 md:w-1/3">
          <img 
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600"
            alt="Delivery"
            className="rounded-lg shadow-lg object-cover w-full h-64 md:h-80"
          />
        </div>
      </div>
    </div>
  );
};
