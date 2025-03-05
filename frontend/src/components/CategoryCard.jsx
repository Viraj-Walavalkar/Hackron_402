import React from 'react';
import { Link } from 'react-router-dom';



export const CategoryCard= ({ title, description, image, link }) => {
  return (
    <Link to={link} className="block">
      <div className="relative overflow-hidden rounded-lg">
        <img 
          src={image} 
          alt={title}
          className="w-full h-[200px] object-cover transform hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h3 className="text-white text-xl font-bold">{title}</h3>
          <p className="text-white/90 text-sm mt-1">{description}</p>
        </div>
      </div>
    </Link>
  );
};