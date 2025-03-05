import React from 'react';
import { calculateDiscount } from '../utils/discount';
import { ShoppingCart } from 'lucide-react';



export const ProductCard = ({ product, onAddToCart }) => {
  const discount = calculateDiscount(product.expiryDate, product.price);
  const finalPrice = product.price - discount;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-sm text-gray-600 mt-1">{product.description}</p>
        <div className="mt-2">
          <span className="text-lg font-bold">₹{finalPrice.toFixed(2)}</span>
          {discount > 0 && (
            <span className="ml-2 text-sm line-through text-gray-500">₹{product.price}</span>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">Units available: {product.quantity}</p>
        <p className="text-sm text-gray-600">Expires: {new Date(product.expiry).toLocaleDateString()}</p>
        <button
          onClick={() => onAddToCart(product)}
          disabled={product.units === 0}
          className="mt-3 w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:bg-gray-300 flex items-center justify-center gap-2"
        >
          <ShoppingCart size={20} />
          Add to Cart
        </button>
      </div>
    </div>
  );
};