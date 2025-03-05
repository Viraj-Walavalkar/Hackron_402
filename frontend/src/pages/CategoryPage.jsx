import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const CategoryPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    let { type } = useParams();

    // Replace with your actual API endpoint
    if (type === undefined) type = "";
    const API_URL = `https://hackron-402.onrender.com/inventory?category=${type}`;

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await fetch(API_URL);
                if (!response.ok) {
                    throw new Error('Failed to fetch products.');
                }

                const data = await response.json();
                setProducts(data);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [type]); // Refetch when category changes

    const handleAddToCart = async (product) => {
        const API_CART_URL = 'https://hackron-402.onrender.com/cart/add'; // Replace with your actual API endpoint

        console.log('Adding to cart:', product);

        try {
            const response = await fetch(API_CART_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_id: product.id,
                    quantity: 1, // Default quantity, modify as needed
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add product to cart');
            }

            const data = await response.json();
            console.log('Product added to cart:', data);
            
            // Show success toast notification
            toast.success(`${product.name} added to cart! 🛒`);

        } catch (error) {
            console.error('Error adding to cart:', error);
            // Show error toast notification
            toast.error('Failed to add item to cart. Try again.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Inventory</h1>

            {/* Loading State */}
            {loading && (
                <div className="min-h-[60vh] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="min-h-[60vh] flex items-center justify-center">
                    <p className="text-red-500">{error}</p>
                </div>
            )}

            {/* No Products Found */}
            {!loading && !error && products.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No products available in the inventory.</p>
                </div>
            )}

            {/* Display Products */}
            {!loading && !error && products.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryPage;
