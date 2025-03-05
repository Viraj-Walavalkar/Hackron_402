import React, { useEffect, useState } from 'react';
import { MapPin, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [location, setLocation] = useState("Detecting location...");
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            
            // Prioritize city, town, village, or county
            const city =
              data.address.city ||
              data.address.town ||
              data.address.village ||
              data.address.county || 
              "Unknown Location";
            
            const state = data.address.state || "";

            setLocation(`${city}, ${state}`);
          } catch (error) {
            setLocation("Location unavailable");
          }
        },
        () => {
          setLocation("Location access denied");
        }
      );
    } else {
      setLocation("Geolocation not supported");
    }
  }, []);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Location */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-green-500">QuickMart</h1>
            </Link>
            <div className="ml-6 flex items-center text-gray-600 text-sm">
              <MapPin size={18} className="text-green-500" />
              <span className="ml-1">{location}</span>
            </div>
          </div>

          {/* Search & Cart */}
          <div className="flex items-center gap-4">
            <input
              type="search"
              placeholder="Search 'eggs'"
              className="px-4 py-2 w-[400px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Link 
              to="/cart"
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              <ShoppingCart size={20} />
              <span>My Cart</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;