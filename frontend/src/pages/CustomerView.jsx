import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../components/Card';
import { Search, Star, AlertCircle, CheckCircle, Store, X, Package } from 'lucide-react';

const CustomerView = () => {
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [search, setSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const authHeader = token ? { headers: { Authorization: `Bearer ${token}` } } : null;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const prodRes = await axios.get('http://localhost:5000/api/products');
      const shopRes = await axios.get('http://localhost:5000/api/shops');
      // Only show products from shops that are Open
      const openShopIds = shopRes.data.filter(s => s.status === 'open').map(s => s._id);
      const availableProducts = prodRes.data.filter(p => openShopIds.includes(p.shop_id?._id || p.shop_id));
      
      setProducts(availableProducts);
      setShops(shopRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRateProduct = async (productId, score) => {
      if (!user) {
          alert('You must be logged in to rate products!');
          return;
      }
      try {
          await axios.post(`http://localhost:5000/api/products/${productId}/rate`, { score }, authHeader);
          fetchData(); // Refresh UI with new dynamic ratings
      } catch (err) {
          console.error(err);
          alert(err.response?.data?.message || 'Failed to rate product');
      }
  };

  const getCheapestPrice = (productName) => {
    const similarProducts = products.filter(p => p.name.toLowerCase() === productName.toLowerCase());
    if (similarProducts.length === 0) return null;
    return Math.min(...similarProducts.map(p => p.price));
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchPrice = maxPrice ? p.price <= Number(maxPrice) : true;
    return matchSearch && matchPrice;
  });

  const clearFilters = () => {
      setSearch('');
      setMaxPrice('');
  };

  const hasFilters = search.length > 0 || maxPrice.length > 0;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Mall Explorer</h1>
        <div className="flex flex-wrap md:flex-nowrap gap-3 items-center w-full md:w-auto">
          <div className="relative flex-grow min-w-[200px] md:w-64">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <input 
            type="number" 
            placeholder="Max Price (₹)" 
            className="px-4 py-2 border rounded-lg w-32 focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
          {hasFilters && (
              <button 
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg flex items-center transition"
                title="Clear Filters"
              >
                  <X className="h-4 w-4 md:mr-1" /> <span className="hidden md:inline">Clear</span>
              </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map(product => {
          const isCheapest = product.price === getCheapestPrice(product.name);
          
          let stockStatus = { text: 'In Stock', color: 'text-green-600', code: 'bg-green-100', Icon: CheckCircle };
          if (product.quantity === 0) {
            stockStatus = { text: 'Out of Stock', color: 'text-red-600', code: 'bg-red-100', Icon: AlertCircle };
          } else if (product.quantity < 5) {
            stockStatus = { text: 'Low Stock', color: 'text-yellow-600', code: 'bg-yellow-100', Icon: AlertCircle };
          }

          const avgRating = product.average_rating || 0;

          return (
            <Card key={product._id} className="relative hover:shadow-lg transition flex flex-col overflow-hidden group">
              {isCheapest && (
                <div className="absolute z-10 top-0 right-0 bg-yellow-400 text-xs text-yellow-900 font-bold px-3 py-1.5 rounded-bl-lg shadow-sm">
                  Best Price
                </div>
              )}
              <div className="h-48 bg-gray-100 w-full relative">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400 flex-col">
                      <Package className="h-10 w-10 mb-2 opacity-20" />
                      <span>No Image</span>
                  </div>
                )}
              </div>
              <div className="p-5 flex-grow flex flex-col">
                <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{product.name}</h3>
                <p className="text-2xl font-bold text-blue-600 my-2">₹{product.price.toLocaleString('en-IN')}</p>
                
                <div className="flex flex-col mb-4 mt-auto space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                      <Store className="h-4 w-4 mr-1 text-gray-400" />
                      <span className="truncate">{product.shop_id?.name || 'Unknown Shop'}</span>
                  </div>

                  <div className="flex items-center">
                    <div className="flex space-x-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                                key={star} 
                                className={`h-4 w-4 cursor-pointer transition-colors ${star <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
                                onClick={() => handleRateProduct(product._id, star)}
                                title={`Rate ${star} stars`}
                            />
                        ))}
                    </div>
                    <span className="ml-2 text-xs font-medium text-gray-500">({product.ratings?.length || 0})</span>
                  </div>
                </div>

                <div className={`flex items-center text-xs font-bold px-2.5 py-1.5 rounded-md w-max ${stockStatus.code} ${stockStatus.color}`}>
                  <stockStatus.Icon className="h-3.5 w-3.5 mr-1.5" />
                  {stockStatus.text} 
                  <span className="ml-1 opacity-75">({product.quantity})</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      {filteredProducts.length === 0 && (
          <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-16 px-4 text-center">
             <div className="bg-gray-100 p-4 rounded-full mb-4">
                 <Search className="h-8 w-8 text-gray-400" />
             </div>
             <h3 className="text-xl font-bold text-gray-800 mb-2">No products found</h3>
             <p className="text-gray-500 max-w-md">We couldn't find any products matching your current search criteria. Try modifying your filters or clearing them.</p>
             {hasFilters && (
                 <button onClick={clearFilters} className="mt-6 font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-6 py-2 rounded-lg transition">
                     Clear All Filters
                 </button>
             )}
          </div>
      )}
    </div>
  );
};

export default CustomerView;
