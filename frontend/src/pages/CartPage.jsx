import React, { useEffect, useState, useRef } from 'react';
import { ShoppingCart, Minus, Plus, Trash2, Loader2, X } from 'lucide-react';
import axios from 'axios';

function CartPage() {
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCheckout, setShowCheckout] = useState(false);
    const previousCartItems = useRef([]);

    useEffect(() => {
        const initializeCart = async () => {
            await requestNotificationPermission();
            await fetchCartItems();
        };
        initializeCart();
    }, []);

    const fetchCartItems = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/get_cart');
            const data = response.data;
            setCartItems(data.items || []);
            checkForDiscountChanges(data.items || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const checkForDiscountChanges = (currentItems) => {
        if (previousCartItems.current.length > 0) {
            currentItems.forEach(currentItem => {
                const previousItem = previousCartItems.current.find(
                    item => item.product_id === currentItem.product_id
                );
                
                if (previousItem && currentItem.discount > previousItem.discount) {
                    const increase = currentItem.discount - previousItem.discount;
                    showDiscountNotification(currentItem.name, increase);
                }
            });
        }
        previousCartItems.current = [...currentItems];
    };

    const showDiscountNotification = (productName, increaseAmount) => {
        if (!("Notification" in window)) {
            console.log("Notifications not supported");
            return;
        }
        
        if (Notification.permission === "granted") {
            try {
                new Notification("Discount Alert! 🎉", {
                    body: `${productName} now has an additional ${increaseAmount.toFixed(1)}% discount!`,
                    icon: "/vite.svg",
                    badge: "/vite.svg",
                    vibrate: [200, 100, 200],
                    tag: "discount-notification",
                    renotify: true
                });
            } catch (error) {
                console.error("Error showing notification:", error);
            }
        }
    };

    const requestNotificationPermission = async () => {
        if (!("Notification" in window)) {
            console.log("This browser does not support notifications");
            return;
        }

        if (Notification.permission !== "granted" && Notification.permission !== "denied") {
            try {
                const permission = await Notification.requestPermission();
                console.log("Notification permission:", permission);
            } catch (error) {
                console.error("Error requesting notification permission:", error);
            }
        }
    };

    const handleAddToCart = async (product, quant) => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/cart/add', {
                product_id: product.product_id,
                quantity: quant,
            });

            if (response.status === 200) {
                console.log('Product quantity updated:', response.data);
                await fetchCartItems();
            }
        } catch (error) {
            console.error('Error updating cart:', error);
            alert('Failed to update cart. Please try again.');
        }
    };

    const handleDelete = async (itemId) => {
        try {
            const response = await axios.post(`http://127.0.0.1:8000/remove_from_cart?product_id=${itemId}`);
            if (response.status === 200) {
                console.log("Item deleted successfully");
                await fetchCartItems();
            }
        } catch (error) {
            console.error("Error deleting item:", error);
            alert('Failed to remove item. Please try again.');
        }
    };

    const calculateItemTotal = (item) => {
        return item.price * item.quantity;
    };

    const calculateItemDiscount = (item) => {
        const itemTotal = calculateItemTotal(item);
        return (itemTotal * item.discount) / 100;
    };

    const calculateDiscountedItemTotal = (item) => {
        return calculateItemTotal(item) - calculateItemDiscount(item);
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => total + calculateItemTotal(item), 0);
    };

    const calculateTotalDiscount = () => {
        return cartItems.reduce((total, item) => total + calculateItemDiscount(item), 0);
    };

    const calculateTotal = () => {
        return calculateSubtotal() - calculateTotalDiscount();
    };

    const CheckoutModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
                    <button 
                        onClick={() => setShowCheckout(false)}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-6">
                    <div className="space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.product_id} className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                    {item.name} (x{item.quantity})
                                </span>
                                <div className="text-right">
                                    {item.discount > 0 ? (
                                        <>
                                            <span className="line-through text-gray-400 mr-2">
                                                ${calculateItemTotal(item).toFixed(2)}
                                            </span>
                                            <span className="text-gray-900">
                                                ${calculateDiscountedItemTotal(item).toFixed(2)}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-gray-900">
                                            ${calculateItemTotal(item).toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-6 pt-6 border-t">
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="text-gray-900">${calculateSubtotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-2 text-green-600">
                            <span>Total Discount</span>
                            <span>-${calculateTotalDiscount().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg mt-4">
                            <span>Total</span>
                            <span>${calculateTotal().toFixed(2)}</span>
                        </div>
                    </div>

                    <button 
                        className="w-full mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        onClick={() => {
                            alert('Processing payment...');
                            setShowCheckout(false);
                        }}
                    >
                        Proceed to Payment
                    </button>
                </div>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex items-center gap-2 text-blue-600">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="font-medium">Loading cart...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg">
                    <p className="font-medium">Error: {error}</p>
                    <button
                        onClick={fetchCartItems}
                        className="mt-2 text-sm underline hover:no-underline"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex items-center gap-2 mb-8">
                    <ShoppingCart className="w-8 h-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
                </div>

                {cartItems.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">Your cart is empty</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md">
                        <div className="p-6">
                            {cartItems.map((item) => (
                                <div key={item.product_id} className="flex items-center justify-between py-6 border-b border-gray-200 last:border-0">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                                        <div className="mt-1 flex items-center gap-4">
                                            {item.discount > 0 ? (
                                                <>
                                                    <span className="line-through text-gray-400">
                                                        ${calculateItemTotal(item).toFixed(2)}
                                                    </span>
                                                    <span className="text-gray-900">
                                                        ${calculateDiscountedItemTotal(item).toFixed(2)}
                                                    </span>
                                                    <span className="text-green-600 text-sm bg-green-50 px-2 py-1 rounded">
                                                        {item.discount.toFixed(1)}% OFF
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-gray-600">
                                                    ${calculateItemTotal(item).toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <button 
                                                className="p-1 hover:bg-gray-100 rounded"
                                                onClick={() => handleAddToCart(item, -1)}
                                            >
                                                <Minus className="w-5 h-5 text-gray-600" />
                                            </button>
                                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                                            <button 
                                                className="p-1 hover:bg-gray-100 rounded"
                                                onClick={() => handleAddToCart(item, 1)}
                                            >
                                                <Plus className="w-5 h-5 text-gray-600" />
                                            </button>
                                        </div>
                                        <button 
                                            className="p-2 hover:bg-red-50 rounded text-red-500"
                                            onClick={() => handleDelete(item.product_id)}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-gray-50 p-6 rounded-b-lg">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-gray-600">Total ({cartItems.length} items)</p>
                                    <div className="mt-1">
                                        {calculateTotalDiscount() > 0 && (
                                            <p className="text-gray-500 line-through">
                                                ${calculateSubtotal().toFixed(2)}
                                            </p>
                                        )}
                                        <p className="text-2xl font-bold text-gray-900">
                                            ${calculateTotal().toFixed(2)}
                                        </p>
                                        {calculateTotalDiscount() > 0 && (
                                            <p className="text-green-600 text-sm">
                                                You save: ${calculateTotalDiscount().toFixed(2)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button 
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                    onClick={() => setShowCheckout(true)}
                                >
                                    Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {showCheckout && <CheckoutModal />}
        </div>
    );
}

export default CartPage;
