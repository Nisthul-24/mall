import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Store, LogOut, LogIn } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Store className="h-8 w-8 text-blue-600 mr-2" />
            <Link to="/" className="text-xl font-bold text-gray-800">ABC Mall</Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600">Hello, {user.name} ({user.role})</span>
                {user.role === 'shop_owner' && (
                  <Link to="/shop-dashboard" className="flex items-center text-gray-600 hover:text-blue-600">
                    <LayoutDashboard className="h-5 w-5 mr-1" /> Dashboard
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin-dashboard" className="flex items-center text-gray-600 hover:text-blue-600">
                    <LayoutDashboard className="h-5 w-5 mr-1" /> Admin Panel
                  </Link>
                )}
                <button onClick={handleLogout} className="flex items-center text-red-600 hover:text-red-800">
                  <LogOut className="h-5 w-5 mr-1" /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="flex items-center text-blue-600 hover:text-blue-800 font-medium">
                <LogIn className="h-5 w-5 mr-1" /> Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
