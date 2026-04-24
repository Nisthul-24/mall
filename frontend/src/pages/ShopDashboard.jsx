import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Card from '../components/Card';
import { Package, DollarSign, TrendingUp, AlertTriangle, Plus, Trash2, Edit2, X, CreditCard, Wallet, CheckCircle, ShoppingCart } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ShopDashboard = () => {
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };
  
   const [newProduct, setNewProduct] = useState({ name: '', price: '', quantity: '', image_url: '', category: 'General', description: '', cost_price: '' });

  useEffect(() => {
    fetchShopData();
  }, []);

  const fetchShopData = async () => {
    try {
      const shopRes = await axios.get(`http://localhost:5000/api/shops/owner/${user.id}`, authHeader);
      const shopData = shopRes.data;
      setShop(shopData);
      
      if (shopData) {
        const prodRes = await axios.get(`http://localhost:5000/api/products/shop/${shopData.id}`);
        setProducts(prodRes.data);
        
        const salesRes = await axios.get(`http://localhost:5000/api/sales/shop/${shopData.id}`);
        setSales(salesRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleShopStatus = async () => {
    try {
      const newStatus = shop.status === 'open' ? 'closed' : 'open';
      const res = await axios.put(`http://localhost:5000/api/shops/${shop.id}`, { status: newStatus }, authHeader);
      setShop(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayment = async () => {
    if (!shop.total_balance || shop.total_balance <= 0) return;
    try {
        await axios.post(`http://localhost:5000/api/shops/pay/${shop.id}`, { amount: shop.total_balance }, authHeader);
        fetchShopData();
        alert('Rent paid successfully!');
    } catch (err) {
        alert('Payment failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/products/${editingId}`, newProduct, authHeader);
      } else {
        await axios.post('http://localhost:5000/api/products', { ...newProduct, shop_id: shop.id }, authHeader);
      }
      setNewProduct({ name: '', price: '', quantity: '', image_url: '', category: 'General', description: '', cost_price: '' });
      setEditingId(null);
      fetchShopData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditInit = (product) => {
    setEditingId(product.id);
    setNewProduct({
        name: product.name,
        price: product.price,
        quantity: product.quantity,
        image_url: product.image_url || '',
        category: product.category || 'General',
        description: product.description || '',
        cost_price: product.cost_price || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewProduct({ name: '', price: '', quantity: '', image_url: '', category: 'General', description: '', cost_price: '' });
  };

  const handleDeleteProduct = async (id) => {
    if(!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, authHeader);
      fetchShopData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkSold = async (product) => {
    if (product.quantity < 1) return alert('Out of stock!');
    try {
      await axios.post('http://localhost:5000/api/sales', {
        product_id: product.id,
        quantity_sold: 1
      }, authHeader);
      fetchShopData();
    } catch (err) {
      alert('Failed to mark sold: ' + (err.response?.data?.message || err.message));
    }
  };

  // Aggregating Sales Data for Chart
  const salesByProduct = {};
  const profitByProduct = {};
  sales.forEach(sale => {
    const pName = sale.Product?.name || 'Unknown';
    salesByProduct[pName] = (salesByProduct[pName] || 0) + sale.quantity_sold;
    
    const cost = sale.Product?.cost_price || 0;
    const profitPerItem = (sale.Product?.price || 0) - cost;
    profitByProduct[pName] = (profitByProduct[pName] || 0) + (profitPerItem * sale.quantity_sold);
  });

  const chartData = {
    labels: Object.keys(salesByProduct),
    datasets: [
      {
        label: 'Items Sold',
        data: Object.values(salesByProduct),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        yAxisID: 'y',
      },
      {
        label: 'Profit (₹)',
        data: Object.values(profitByProduct),
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        yAxisID: 'y1',
      }
    ]
  };

  const chartOptions = {
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Items Sold' } },
      y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Profit (₹)' } }
    }
  };

  const lowStock = products.filter(p => p.quantity < 5);
  if (!shop) return <div className="text-center p-8 mt-10">No shop registered to this owner.</div>;

  const totalRevenue = sales.reduce((acc, sale) => acc + (sale.quantity_sold * (sale.Product?.price || 0)), 0);
  const totalProfit = sales.reduce((acc, sale) => {
    const cost = sale.Product?.cost_price || 0;
    const profitPerItem = (sale.Product?.price || 0) - cost;
    return acc + (profitPerItem * sale.quantity_sold);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{shop.name} Dashboard</h1>
          <p className="text-gray-500">Manage your shop operations.</p>
        </div>
        <button 
          onClick={toggleShopStatus}
          className={`px-4 py-2 text-white font-medium rounded-lg transition ${shop.status === 'open' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
        >
          {shop.status === 'open' ? 'Close Shop' : 'Open Shop'}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 flex items-center">
          <div className="p-3 bg-blue-100 rounded-lg mr-4"><DollarSign className="h-6 w-6 text-blue-600" /></div>
          <div><p className="text-sm text-gray-500">Revenue</p><p className="text-xl font-bold text-gray-800">₹{totalRevenue.toLocaleString('en-IN')}</p></div>
        </Card>
        <Card className="p-4 flex items-center">
          <div className="p-3 bg-emerald-100 rounded-lg mr-4"><Wallet className="h-6 w-6 text-emerald-600" /></div>
          <div><p className="text-sm text-gray-500">Profit</p><p className="text-xl font-bold text-gray-800">₹{totalProfit.toLocaleString('en-IN')}</p></div>
        </Card>
        <Card className="p-4 flex items-center">
          <div className="p-3 bg-green-100 rounded-lg mr-4"><Package className="h-6 w-6 text-green-600" /></div>
          <div><p className="text-sm text-gray-500">Products</p><p className="text-xl font-bold text-gray-800">{products.length}</p></div>
        </Card>
        <Card className="p-4 flex items-center">
          <div className="p-3 bg-purple-100 rounded-lg mr-4"><TrendingUp className="h-6 w-6 text-purple-600" /></div>
          <div><p className="text-sm text-gray-500">Sales</p><p className="text-xl font-bold text-gray-800">{sales.length}</p></div>
        </Card>
        <Card className="p-4 flex items-center relative overflow-hidden col-span-2 lg:col-span-1">
          {shop.total_balance > 0 && <div className="absolute top-0 right-0 h-16 w-16 bg-red-500/10 rotate-45 translate-x-8 -translate-y-8"></div>}
          <div className="p-3 bg-red-100 rounded-lg mr-4"><CreditCard className="h-6 w-6 text-red-600" /></div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">Rent Balance</p>
            <p className="text-xl font-bold text-red-600">₹{(shop.total_balance || 0).toLocaleString('en-IN')}</p>
            <div className="text-[9px] text-gray-400 font-medium mt-1 uppercase">
                Base Rent: ₹{shop.rent_amount}
            </div>
          </div>
          {shop.total_balance > 0 && (
            <button onClick={handlePayment} className="text-[10px] bg-red-600 text-white px-2 py-1.5 rounded font-bold hover:bg-red-700 transition shadow-sm z-10 ml-2">PAY</button>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><Package className="h-5 w-5 mr-2 text-blue-500" /> Manage Products</h2>
          
          <form onSubmit={handleSubmit} className={`grid grid-cols-2 md:grid-cols-6 gap-3 mb-6 p-4 rounded-xl border transition-all ${editingId ? 'bg-indigo-50 border-indigo-200 shadow-inner' : 'bg-gray-50 border-gray-100'}`}>
            <input type="text" placeholder="Name" required className="col-span-2 md:col-span-1 px-3 py-2 border rounded outline-none focus:ring-1 focus:ring-blue-500 text-sm" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
            <select required className="px-3 py-2 border rounded outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-white" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                <option value="General">Category</option>
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Groceries">Groceries</option>
                <option value="Books">Books</option>
                <option value="Food">Food</option>
            </select>
            <input type="number" placeholder="Price (₹)" required className="px-3 py-2 border rounded outline-none focus:ring-1 focus:ring-blue-500 text-sm" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
            <input type="number" placeholder="Cost (₹)" required className="px-3 py-2 border rounded outline-none focus:ring-1 focus:ring-blue-500 text-sm" value={newProduct.cost_price} onChange={e => setNewProduct({...newProduct, cost_price: e.target.value})} />
            <input type="number" placeholder="Qty" required className="px-3 py-2 border rounded outline-none focus:ring-1 focus:ring-blue-500 text-sm" value={newProduct.quantity} onChange={e => setNewProduct({...newProduct, quantity: e.target.value})} />
            <input type="url" placeholder="Image URL" className="px-3 py-2 border rounded outline-none focus:ring-1 focus:ring-blue-500 text-sm" value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} />
            <input type="text" placeholder="Basic Description (optional)" className="col-span-2 md:col-span-6 px-3 py-2 border rounded outline-none focus:ring-1 focus:ring-blue-500 text-sm" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
            
            <div className="col-span-2 md:col-span-6 flex gap-2">
                <button type="submit" className={`flex-1 text-white font-bold rounded flex items-center justify-center py-2 transition shadow-sm ${editingId ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                    {editingId ? <CheckCircle className="h-5 w-5" /> : <><Plus className="h-4 w-4 mr-1" /> Add</>}
                </button>
                {editingId && (
                    <button type="button" onClick={cancelEdit} className="bg-gray-300 hover:bg-gray-400 text-gray-700 rounded px-3 py-2 transition flex items-center justify-center">
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-gray-500 text-sm">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Price</th>
                  <th className="pb-2 font-medium">Qty</th>
                  <th className="pb-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 flex-grow">
                    <td className="py-2 text-gray-800 font-medium">{p.name}</td>
                    <td className="py-2 text-gray-600">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="py-2">
                       <span className={`px-2 py-0.5 rounded text-xs font-semibold ${p.quantity < 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{p.quantity}</span>
                    </td>
                    <td className="py-2 flex justify-end gap-2">
                      <button onClick={() => handleMarkSold(p)} disabled={p.quantity < 1} className="text-emerald-500 hover:text-emerald-700 p-1 disabled:opacity-50" title="Sell 1 Item"><ShoppingCart className="h-4 w-4" /></button>
                      <button onClick={() => handleEditInit(p)} className="text-blue-500 hover:text-blue-700 p-1" title="Edit"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="text-red-500 hover:text-red-700 p-1" title="Delete"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Sales & Profit Analytics</h2>
            <div className="h-48">
              {sales.length > 0 ? <Bar data={chartData} options={chartOptions} /> : <p className="text-gray-500 text-center mt-16 text-sm">No sales data available</p>}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Low Stock</h2>
            {lowStock.length > 0 ? (
              <ul className="divide-y">
                {lowStock.map(p => (
                  <li key={p.id} className="py-2 flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-700">{p.name}</span>
                    <span className="text-red-600 font-semibold">{p.quantity} left</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-green-600 bg-green-50 p-2 rounded text-sm font-medium">All products stocked. 🌟</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ShopDashboard;
