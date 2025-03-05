import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import  Navbar  from './components/Navbar';
import  Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import CartPage from './pages/CartPage';
// import { CategoryPage } from './pages/CategoryPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path='/category/:type' element={<CategoryPage />} />
          <Route path='/cart' element={<CartPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;