import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { 
    Chart as ChartJS, 
    ArcElement, 
    Tooltip, 
    Legend, 
    CategoryScale, 
    LinearScale, 
    BarElement, 
    PointElement, 
    LineElement, 
    Title 
} from 'chart.js';
import Card from '../components/Card';
import { TrendingUp, PieChart, BarChart, Target, DollarSign } from 'lucide-react';

ChartJS.register(
    ArcElement, 
    Tooltip, 
    Legend, 
    CategoryScale, 
    LinearScale, 
    BarElement, 
    PointElement, 
    LineElement, 
    Title
);

const AdminAnalytics = () => {
    const [data, setData] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/analytics/admin-overview', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
        }
    };

    if (!data) return <div className="p-8 text-center text-gray-500">Loading Analytics...</div>;

    const shopRevenueData = {
        labels: data.shopRevenue.map(s => s.shop_name),
        datasets: [{
            data: data.shopRevenue.map(s => s.revenue),
            backgroundColor: [
                'rgba(59, 130, 246, 0.7)',
                'rgba(16, 185, 129, 0.7)',
                'rgba(245, 158, 11, 0.7)',
                'rgba(239, 68, 68, 0.7)',
                'rgba(139, 92, 246, 0.7)',
            ]
        }]
    };

    const categoryRevenueData = {
        labels: data.categoryRevenue.map(c => c.category),
        datasets: [{
            label: 'Revenue (₹)',
            data: data.categoryRevenue.map(c => c.revenue),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
        }]
    };

    const monthlyProfitData = {
        labels: data.monthlyProfit.map(m => m.month),
        datasets: [{
            label: 'Total Revenue (₹)',
            data: data.monthlyProfit.map(m => m.revenue),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
        }]
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex flex-col gap-6">
                    <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                        <Target className="h-8 w-8 mb-4 opacity-80" />
                        <p className="text-sm font-medium opacity-80">Next Month Potential</p>
                        <p className="text-2xl font-bold">₹{data.prediction.expectedTotal.toLocaleString('en-IN')}</p>
                        <div className="mt-2 text-xs opacity-70">
                            Base Rent Only
                        </div>
                    </Card>
                    <Card className="p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex-1">
                        <DollarSign className="h-8 w-8 mb-4 opacity-80" />
                        <p className="text-sm font-medium opacity-80">Rent Collected (This Month)</p>
                        <p className="text-2xl font-bold">₹{(data.collectedRentCurrentMonth || 0).toLocaleString('en-IN')}</p>
                    </Card>
                </div>
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <PieChart className="h-5 w-5 text-blue-600" />
                            <h3 className="font-bold text-gray-800">Revenue by Shop</h3>
                        </div>
                        <div className="h-64 flex justify-center">
                            <Pie data={shopRevenueData} options={{ maintainAspectRatio: false }} />
                        </div>
                    </Card>
                    <Card className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart className="h-5 w-5 text-blue-600" />
                            <h3 className="font-bold text-gray-800">Revenue by Category</h3>
                        </div>
                        <div className="h-64">
                            <Bar data={categoryRevenueData} options={{ maintainAspectRatio: false }} />
                        </div>
                    </Card>
                </div>
            </div>

            <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <h3 className="font-bold text-gray-800">Growth Trends (Revenue)</h3>
                </div>
                <div className="h-80">
                    <Line data={monthlyProfitData} options={{ maintainAspectRatio: false }} />
                </div>
            </Card>
        </div>
    );
};

export default AdminAnalytics;
