import React from 'react';
import { Hero } from '../components/Hero';
import { CategoryCard } from '../components/CategoryCard';

const categories = [
  {
    title: "Fresh Groceries",
    description: "Fresh fruits, vegetables & daily essentials",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=500",
    link: "/category/groceries"
  },
  {
    title: "Pharmacy",
    description: "Medicines & healthcare products",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=500",
    link: "/category/pharmacy"
  },
  {
    "title": "Dairy Products",
    "description": "Milk, cheese, butter & more",
    "image": "https://media.istockphoto.com/id/495950860/photo/dairy-products.jpg?s=612x612&w=0&k=20&c=Ude6moS6QGGfPt7g3NlmTW5JMGq0NlpssAf7iOvCFhI=",
    "link": "/category/dairy"
}
,
  {
    title: "Baby Care",
    description: "Diapers, food & baby essentials",
    image: "https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&q=80&w=500",
    link: "/category/baby"
  },
  {
    title: "Snacks",
    description: "Chips, drinks & party essentials",
    image: "https://images.unsplash.com/photo-1527960471264-932f39eb5846?auto=format&fit=crop&q=80&w=500",
    link: "/category/snacks"
  },
  {
    title: "Beverages",
    description: "Household items & cleaning supplies",
    image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&q=80&w=500",
    link: "/category/beverages"
  }
];

const Home = () => {
  return (
    <div>
      <Hero />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.title} {...category} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home