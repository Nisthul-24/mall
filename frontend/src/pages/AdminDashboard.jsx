import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { Store, CheckCircle, AlertCircle, DollarSign, Trash2, Plus, PieChart, Layout } from 'lucide-react';
import AdminAnalytics from '../components/AdminAnalytics';

const AdminDashboard = () => {
  const [shops, setShops] = useState([]);
  const [activeTab, setActiveTab] = useState('shops');
  const [isCreating, setIsCreating] = useState(false);
  const [newShop, setNewShop] = useState({
      shopName: '',
      ownerName: '',
      ownerEmail: '',
      password: '',
      rentAmount: ''
  });
  
  const token = localStorage.getItem('token');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };
  const navigate = useNavigate();

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/shops');
      setShops(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  const handlePayment = async (shopId, amount) => {
    try {
      await axios.post(`http://localhost:5000/api/shops/pay/${shopId}`, { amount }, authHeader);
      fetchShops(); 
    } catch (err) {
      if(err.response?.status === 401 || err.response?.status === 403) navigate('/login');
      alert('Payment failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteShop = async (shopId) => {
      if(!window.confirm('Are you sure you want to delete this shop entirely?')) return;
      try {
          await axios.delete(`http://localhost:5000/api/shops/${shopId}`, authHeader);
          fetchShops();
      } catch (err) {
          console.error(err);
      }
  };

  const handleCreateShop = async (e) => {
      e.preventDefault();
      try {
          const userRes = await axios.post('http://localhost:5000/api/auth/register', {
              name: newShop.ownerName,
              email: newShop.ownerEmail,
              password: newShop.password,
              role: 'shop_owner'
          });
          const createdUserId = userRes.data.user.id;
          await axios.post('http://localhost:5000/api/shops', {
              name: newShop.shopName,
              owner_id: createdUserId,
              rent_amount: Number(newShop.rentAmount),
              status: 'open',
              rent_status: 'Pending'
          }, authHeader);
          setIsCreating(false);
          setNewShop({ shopName: '', ownerName: '', ownerEmail: '', password: '', rentAmount: '' });
          fetchShops();
      } catch (err) {
          alert('Failed to create shop: ' + (err.response?.data?.message || err.message));
      }
  };

  const totalShops = shops.length;
  const activeShops = shops.filter(s => s.status === 'open').length;
  const totalArrears = shops.reduce((acc, s) => acc + (s.total_balance || 0), 0);
  const pendingRentShops = shops.filter(s => (s.total_balance || 0) > 0);
  const topShops = [...shops].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Mall Administration</h1>
            <p className="text-gray-500">Overview of all mall operations and shops.</p>
        </div>
        <div className="flex gap-2">
            <div className="bg-gray-100 p-1 rounded-lg flex mr-4">
                <button 
                    onClick={() => setActiveTab('shops')}
                    className={`flex items-center px-4 py-2 rounded-md font-medium transition ${activeTab === 'shops' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                >
                    <Layout className="h-4 w-4 mr-2" /> Shops
                </button>
                <button 
                    onClick={() => setActiveTab('analytics')}
                    className={`flex items-center px-4 py-2 rounded-md font-medium transition ${activeTab === 'analytics' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                >
                    <PieChart className="h-4 w-4 mr-2" /> Analytics
                </button>
            </div>
            <button 
                onClick={() => setIsCreating(!isCreating)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
                <Plus className="h-5 w-5 mr-1" /> {isCreating ? 'Cancel Creation' : 'Register New Shop'}
            </button>
        </div>
      </div>

      {activeTab === 'analytics' ? (
          <AdminAnalytics />
      ) : (
          <>
            {isCreating && (
                <Card className="p-6 border-l-4 border-blue-500">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">Register New Shop & Owner</h2>
                    <form onSubmit={handleCreateShop} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Shop Name</label>
                            <input type="text" required className="w-full border p-2 rounded focus:ring-1 focus:ring-blue-500 outline-none" value={newShop.shopName} onChange={e => setNewShop({...newShop, shopName: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Monthly Rent Amount (₹)</label>
                            <input type="number" required className="w-full border p-2 rounded focus:ring-1 focus:ring-blue-500 outline-none" value={newShop.rentAmount} onChange={e => setNewShop({...newShop, rentAmount: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Owner Full Name</label>
                            <input type="text" required className="w-full border p-2 rounded focus:ring-1 focus:ring-blue-500 outline-none" value={newShop.ownerName} onChange={e => setNewShop({...newShop, ownerName: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Owner Email</label>
                            <input type="email" required className="w-full border p-2 rounded focus:ring-1 focus:ring-blue-500 outline-none" value={newShop.ownerEmail} onChange={e => setNewShop({...newShop, ownerEmail: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Temporary Password</label>
                            <input type="password" required className="w-full border p-2 rounded focus:ring-1 focus:ring-blue-500 outline-none" value={newShop.password} onChange={e => setNewShop({...newShop, password: e.target.value})} />
                        </div>
                        <div className="md:col-span-2 flex justify-end mt-2">
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow transition">
                                Create Shop
                            </button>
                        </div>
                    </form>
                </Card>
            )}
            {/* The rest of the original dashboard content goes here... */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 flex items-center">
          <div className="p-4 bg-blue-100 rounded-xl mr-5">
            <Store className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Shops</p>
            <p className="text-2xl font-bold text-gray-800">{totalShops}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center">
          <div className="p-4 bg-green-100 rounded-xl mr-5">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active (Open) Shops</p>
            <p className="text-2xl font-bold text-gray-800">{activeShops}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center">
          <div className="p-4 bg-red-100 rounded-xl mr-5">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Arrears (Due)</p>
            <p className="text-2xl font-bold text-gray-800">₹{totalArrears.toLocaleString('en-IN')}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Shop Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="border-b text-gray-500 text-sm">
                  <th className="pb-3 font-medium">Shop Name</th>
                  <th className="pb-3 font-medium">Owner</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Rent</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {shops.map(shop => (
                  <tr key={shop.id} className="hover:bg-gray-50 transition">
                    <td className="py-4 font-medium text-gray-800">{shop.name}</td>
                    <td className="py-4 text-gray-600 break-all">{shop.User?.name || 'Unknown'}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${shop.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {shop.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="text-gray-800 font-medium">₹{(shop.total_balance || 0).toLocaleString('en-IN')}</div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold mt-1 inline-block ${shop.total_balance <= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {shop.total_balance <= 0 ? 'Paid' : 'Pending Arrears'}
                      </span>
                      <div className="text-[10px] text-gray-400 mt-0.5">Base: ₹{shop.rent_amount}</div>
                    </td>
                    <td className="py-4 text-right">
                        <div className="flex justify-end items-center gap-2 mt-1">
                            {shop.total_balance > 0 && (
                                <button 
                                    onClick={() => handlePayment(shop.id, shop.total_balance)}
                                    className="text-xs px-2 py-1 rounded font-medium transition border border-green-200 text-green-700 hover:bg-green-50"
                                >
                                    Clear Balance
                                </button>
                            )}
                            <button 
                                onClick={() => handleDeleteShop(shop.id)}
                                className="p-1 text-red-500 hover:text-red-700 transition hover:bg-red-50 rounded"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </td>
                  </tr>
                ))}
                {shops.length === 0 && (
                    <tr><td colSpan="5" className="text-center py-6 text-gray-500">No shops found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center mb-4">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              Rent Pending Alerts
            </h2>
            {pendingRentShops.length > 0 ? (
              <ul className="space-y-3">
                {pendingRentShops.map(shop => (
                  <li key={shop.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                    <div>
                        <p className="font-medium text-red-800">{shop.name}</p>
                        <p className="text-[10px] text-red-600">Last Billed: {shop.last_billed_month || 'N/A'}</p>
                    </div>
                    <span className="text-red-600 font-bold">₹{shop.total_balance.toLocaleString('en-IN')}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-green-600 bg-green-50 p-3 rounded-lg text-sm font-medium">All shops have paid their rent! 🎉</p>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center mb-4">
              <Store className="h-5 w-5 text-yellow-500 mr-2" />
              Top Rank Shops
            </h2>
            <ul className="space-y-3">
              {topShops.length > 0 ? topShops.map((shop, idx) => (
                <li key={shop.id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition">
                  <div className="h-8 w-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center font-bold mr-3 shadow-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{shop.name}</p>
                    <p className="text-xs text-gray-500 font-medium">{shop.rating || 0} Stars Rating</p>
                  </div>
                </li>
              )) : (
                <p className="text-sm text-gray-500">No rated shops.</p>
              )}
            </ul>
          </Card>
        </div>
      </div>
          </>
      )}
    </div>
  );
};

export default AdminDashboard;
