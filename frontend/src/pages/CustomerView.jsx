import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../components/Card';
import { Search, Star, AlertCircle, CheckCircle, Store, X, Package, History, Heart } from 'lucide-react';
import WishlistButton from '../components/WishlistButton';
import ProductModal from '../components/ProductModal';

const CustomerView = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalTab, setModalTab] = useState('details');
  const [search, setSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [wishlistProductIds, setWishlistProductIds] = useState([]);
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);
  
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const authHeader = token ? { headers: { Authorization: `Bearer ${token}` } } : null;

  useEffect(() => {
    fetchData();
    fetchCategories();
    if (user) {
        fetchRecentlyViewed();
        fetchWishlist();
    }
  }, [selectedCategory]);

  const fetchData = async () => {
    try {
      const url = selectedCategory === 'All' 
        ? 'http://localhost:5000/api/products' 
        : `http://localhost:5000/api/products?category=${selectedCategory}`;
      const prodRes = await axios.get(url);
      const shopRes = await axios.get('http://localhost:5000/api/shops');
      
      const openShopIds = shopRes.data.filter(s => s.status === 'open').map(s => s.id);
      const availableProducts = prodRes.data.filter(p => openShopIds.includes(p.shop_id?.id || p.shop_id));
      
      setProducts(availableProducts);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
        const res = await axios.get('http://localhost:5000/api/products/categories');
        setCategories(['All', ...res.data]);
    } catch (err) {
        console.error(err);
    }
  };

  const fetchRecentlyViewed = async () => {
    try {
        const res = await axios.get('http://localhost:5000/api/history', authHeader);
        setRecentlyViewed(res.data);
    } catch (err) {
        console.error(err);
    }
  };

  const fetchWishlist = async () => {
      try {
          const res = await axios.get('http://localhost:5000/api/wishlist', authHeader);
          setWishlistProductIds(res.data.map(item => item.id));
      } catch (err) {
          console.error(err);
      }
  };

  const trackView = async (productId) => {
    if (!user) return;
    try {
        await axios.post(`http://localhost:5000/api/history/${productId}`, {}, authHeader);
    } catch (err) {
        console.error(err);
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
    const matchWishlist = showWishlistOnly ? wishlistProductIds.includes(p.id) : true;
    return matchSearch && matchPrice && matchWishlist;
  });

  const clearFilters = () => {
      setSearch('');
      setMaxPrice('');
      setSelectedCategory('All');
      setShowWishlistOnly(false);
  };

  const hasFilters = search.length > 0 || maxPrice.length > 0 || selectedCategory !== 'All' || showWishlistOnly;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
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
            {user && (
                <button 
                    onClick={() => setShowWishlistOnly(!showWishlistOnly)}
                    className={`px-4 py-2 rounded-lg flex items-center transition border ${showWishlistOnly ? 'bg-red-50 border-red-200 text-red-600 shadow-inner' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                    <Heart className={`h-4 w-4 md:mr-1 ${showWishlistOnly ? 'fill-current' : ''}`} /> 
                    <span className="hidden md:inline">{showWishlistOnly ? 'Wishlisted' : 'Wishlist'}</span>
                </button>
            )}
            {hasFilters && (
                <button 
                    onClick={clearFilters}
                    className="px-3 py-2 text-sm text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg flex items-center transition"
                >
                    <X className="h-4 w-4 md:mr-1" /> <span className="hidden md:inline">Clear</span>
                </button>
            )}
            </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${selectedCategory === cat ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    {cat}
                </button>
            ))}
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
            <Card key={product.id} className="relative hover:shadow-lg transition flex flex-col overflow-hidden group border-none ring-1 ring-gray-100">
              <div className="absolute top-2 right-2 z-10">
                <WishlistButton 
                    productId={product.id} 
                    initialIsWishlisted={wishlistProductIds.includes(product.id)} 
                    onToggle={fetchWishlist}
                />
              </div>
              {isCheapest && (
                <div className="absolute z-10 top-0 left-0 bg-yellow-400 text-[10px] text-yellow-900 font-black px-2 py-1 rounded-br-lg uppercase tracking-wider">
                  Best Price
                </div>
              )}
              <div className="h-48 bg-gray-50 w-full relative cursor-pointer" onClick={() => { trackView(product.id); setSelectedProduct(product); setModalTab('details'); }}>
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-300 flex-col">
                      <Package className="h-10 w-10 mb-2 opacity-20" />
                      <span className="text-xs">No Image</span>
                  </div>
                )}
              </div>
              <div className="p-5 flex-grow flex flex-col cursor-pointer" onClick={() => { trackView(product.id); setSelectedProduct(product); setModalTab('details'); }}>
                <div className="text-[10px] uppercase font-bold text-blue-500 mb-1">{product.category}</div>
                <h3 className="font-bold text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                <p className="text-xl font-bold text-gray-900 my-2">₹{product.price.toLocaleString('en-IN')}</p>
                
                <div className="flex flex-col mb-4 mt-auto space-y-2">
                  <div className="flex items-center text-xs text-gray-500">
                      <Store className="h-3.5 w-3.5 mr-1 text-gray-400" />
                      <span className="truncate">{product.Shop?.name || 'Unknown Shop'}</span>
                  </div>

                  <div 
                    className="flex items-center hover:bg-gray-100 p-1 rounded -ml-1 transition"
                    onClick={(e) => { e.stopPropagation(); trackView(product.id); setSelectedProduct(product); setModalTab('reviews'); }}
                  >
                    <div className="flex text-yellow-400">
                        <Star className="h-3.5 w-3.5 fill-current" />
                    </div>
                    <span className="ml-1 text-xs font-bold text-gray-700">{avgRating > 0 ? avgRating.toFixed(1) : 0}</span>
                    <span className="ml-1 text-[10px] text-gray-400 font-medium">({product.rating_count || 0})</span>
                  </div>
                </div>

                <div className={`flex items-center text-[10px] font-bold px-2 py-1 rounded w-max ${stockStatus.code} ${stockStatus.color}`}>
                  <stockStatus.Icon className="h-3 w-3 mr-1" />
                  {stockStatus.text} 
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      <ProductModal 
          product={selectedProduct} 
          isOpen={!!selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          initialTab={modalTab}
      />

      {user && recentlyViewed.length > 0 && (
          <div className="space-y-4 pt-6 mt-12 border-t">
              <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-gray-400" />
                  <h2 className="text-xl font-bold text-gray-800">Recently Viewed</h2>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {recentlyViewed.map(item => (
                      <div key={item.id} className="min-w-[150px] bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex flex-col items-center">
                          <img src={item.image_url} alt={item.name} className="h-20 w-20 object-cover rounded mb-2" />
                          <p className="text-xs font-bold text-gray-800 line-clamp-1 w-full text-center">{item.name}</p>
                          <p className="text-xs text-blue-600 font-bold">₹{item.price}</p>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {filteredProducts.length === 0 && (
          <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-16 px-4 text-center">
             <div className="bg-gray-100 p-4 rounded-full mb-4">
                 <Search className="h-8 w-8 text-gray-400" />
             </div>
             <h3 className="text-xl font-bold text-gray-800 mb-2">No products found</h3>
             <p className="text-gray-500 max-w-md">Try modifying your filters or clearing them to see more products.</p>
          </div>
      )}
    </div>
  );
};

export default CustomerView;

