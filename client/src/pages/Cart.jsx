import React from 'react';
import { Link } from 'react-router-dom';

function Cart() {
  return (
    <div className="max-w-2xl mx-auto bg-white p-8 mt-10 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center text-yellow-500">Your Cart</h1>
      
      <div className="text-center space-y-4">
        <p className="text-gray-600">Your cart is empty or items will be displayed here.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/menu" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-full transition-all duration-300 hover:scale-105">
            Browse Menu
          </Link>
          <Link to="/checkout" className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 hover:scale-105">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Cart;
