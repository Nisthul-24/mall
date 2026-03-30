import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Login from './pages/Login';
import CustomerView from './pages/CustomerView';
import ShopDashboard from './pages/ShopDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children, allowedRole }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/" replace />;
  return children;
};

const AppLayout = ({ children }) => {
  const location = useLocation();
  const isAuthRoute = location.pathname === '/login';

  if (isAuthRoute) {
      // Return raw canvas for the immersive Hero background without navbar/margins causing gray bleed
      return <div className="min-h-screen bg-[#e3d2bd] text-white w-full">{children}</div>;
  }

  return (
      <div className="min-h-screen flex flex-col bg-[#e3d2bd]">
        <Navbar />
        <div className="flex-grow p-4 md:p-8">
            {children}
        </div>
      </div>
  );
};

function App() {
  return (
    <Router>
      <AppLayout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<CustomerView />} />
            <Route 
                path="/shop-dashboard" 
                element={
                    <ProtectedRoute allowedRole="shop_owner">
                        <ShopDashboard />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/admin-dashboard" 
                element={
                    <ProtectedRoute allowedRole="admin">
                        <AdminDashboard />
                    </ProtectedRoute>
                } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
