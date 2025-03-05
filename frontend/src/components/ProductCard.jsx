import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { calculateDiscount } from '../utils/discount';
import { ShoppingCart, Plus, Minus } from 'lucide-react';

export const ProductCard = ({ product, onAddToCart }) => {
  const [isInCart, setIsInCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await axios.get('https://hackron-402.onrender.com/get_cart');
        const data = response.data;

        const cartItem = data.items.find(item => item.product_id === product.id);
        if (cartItem) {
          setQuantity(cartItem.quantity);
          setIsInCart(cartItem.quantity > 0);
        }
      } catch (err) {
        console.error('Error fetching cart items:', err);
      }
    };

    fetchCartItems();
  }, [product.id]);

  const discount = calculateDiscount(product.expiryDate, product.price);
  const finalPrice = product.price - discount;
  const isSoldOut = product.quantity === 0;

  const handleAddToCart = () => {
    onAddToCart({ ...product, quantity });
    setIsInCart(true);
  };

  const handleAddToCart2 = async (product, quant) => {
    try {
      console.log(product);
      
      const response = await axios.post('https://hackron-402.onrender.com/cart/add', {
        product_id: product.id,
        quantity: quant,
      });

      if (response.status === 200) {
        console.log('Product quantity updated:', response.data);
        // await fetchCartItems();
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      alert('Failed to update cart. Please try again.');
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) {
      setIsInCart(false);
      setQuantity(1);
      onAddToCart({ ...product, quantity: 0 }); // Remove from cart
      return;
    }

    const updatedQuantity = Math.min(newQuantity, product.quantity);
    setQuantity(updatedQuantity);
    onAddToCart({ ...product, quantity: updatedQuantity });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Invalid Date";
  
    // Split dd/mm/yyyy into [dd, mm, yyyy]
    const [day, month, year] = dateStr.split("/");
  
    // Create a valid Date object (YYYY, MM-1, DD)
    const dateObj = new Date(`${year}-${month}-${day}`);
  
    // Format it in a readable format (DD/MM/YYYY)
    return dateObj.toLocaleDateString("en-GB"); // "en-GB" ensures DD/MM/YYYY format
  };
  

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
        <p className="text-sm text-gray-600">Expires: {formatDate(product.expiry)}</p>

        {isSoldOut ? (
          <span className="mt-3 w-full block bg-red-500 text-white py-2 px-4 rounded-md text-center">
            Sold Out
          </span>
        ) : isInCart ? (
          <div className="mt-3">
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-md">
              <button
                onClick={() => {
                  handleQuantityChange(quantity - 1)
                  handleAddToCart2(product, -1)
                }}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-l-md"
              >
                <Minus size={20} />
              </button>
              <span className="px-4 py-2 text-gray-700 font-medium">{quantity}</span>
              <button
                onClick={() => {
                  handleQuantityChange(quantity + 1)
                  handleAddToCart2(product, 1)
                }}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-r-md"
                disabled={quantity >= product.quantity}
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            className="mt-3 w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 flex items-center justify-center gap-2"
          >
            <ShoppingCart size={20} />
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
};
