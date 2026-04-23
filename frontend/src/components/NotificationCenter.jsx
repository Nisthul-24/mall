import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Check, Trash2, AlertTriangle, Info, CreditCard } from 'lucide-react';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const token = localStorage.getItem('token');

    const fetchNotifications = async () => {
        if (!token) return;
        try {
            const res = await axios.get('http://localhost:5000/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Polling every minute
        return () => clearInterval(interval);
    }, [token]);

    const markAsRead = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put('http://localhost:5000/api/notifications/read-all', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        } catch (err) {
            console.error(err);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const getIcon = (type) => {
        switch (type) {
            case 'rent_due': return <AlertTriangle className="h-4 w-4 text-red-500" />;
            case 'payment_received': return <CreditCard className="h-4 w-4 text-green-500" />;
            case 'admin_alert': return <Info className="h-4 w-4 text-blue-500" />;
            default: return <Bell className="h-4 w-4 text-gray-500" />;
        }
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 text-gray-600 hover:text-blue-600 transition focus:outline-none"
            >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center h-4 w-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800">Notifications</h3>
                            {unreadCount > 0 && (
                                <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:underline font-medium">
                                    Mark all read
                                </button>
                            )}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map(notif => (
                                    <div 
                                        key={notif.id} 
                                        onClick={() => !notif.is_read && markAsRead(notif.id)}
                                        className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition flex gap-3 ${!notif.is_read ? 'bg-blue-50/30' : ''}`}
                                    >
                                        <div className="mt-1 flex-shrink-0">
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm ${!notif.is_read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                                {notif.message}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-1">
                                                {new Date(notif.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        {!notif.is_read && (
                                            <div className="h-2 w-2 bg-blue-600 rounded-full mt-2"></div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">No notifications yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationCenter;
