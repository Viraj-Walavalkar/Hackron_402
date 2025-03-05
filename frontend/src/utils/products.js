import axios from 'axios';

// Mock data for development
const mockProducts = {
  groceries: [
    {
      id: '1',
      name: 'Fresh Organic Bananas',
      price: 40,
      description: 'Sweet and fresh organic bananas',
      image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&q=80&w=500',
      category: 'groceries',
      stock: 50
    },
    {
      id: '2',
      name: 'Red Apples',
      price: 120,
      description: 'Fresh red apples from Himachal',
      image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=500',
      category: 'groceries',
      stock: 30
    }
  ],
  'pet-care': [
    {
      id: '3',
      name: 'Premium Dog Food',
      price: 999,
      description: 'Nutritious food for your furry friend',
      image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=500',
      category: 'pet-care',
      stock: 15
    }
  ],
  pharmacy: [
    {
      id: '4',
      name: 'First Aid Kit',
      price: 499,
      description: 'Essential first aid supplies',
      image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&q=80&w=500',
      category: 'pharmacy',
      stock: 25
    }
  ]
};

const API_URL = 'https://hackron-402.onrender.com/inventory'; // Replace with your actual API URL

export const getProductsByCategory = async (category) => {
  try {
    // For development, return mock data
    if (process.env.NODE_ENV === 'development') {
      return mockProducts[category] || [];
    }

    const response = await axios.get(`${API_URL}`);
    return response.data;
  } catch (error) {
    // Safely handle error logging
    if (error instanceof Error) {
      console.error('Error fetching products:', error.message);
    } else {
      console.error('An unknown error occurred while fetching products');
    }
    return [];
  }
};
