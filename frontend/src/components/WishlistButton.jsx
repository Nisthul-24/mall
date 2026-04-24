import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart } from 'lucide-react';

const WishlistButton = ({ productId, initialIsWishlisted = false, onToggle }) => {
    const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        setIsWishlisted(initialIsWishlisted);
    }, [initialIsWishlisted]);

    const toggleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!token) return alert('Please login to use wishlist');
        
        setLoading(true);
        try {
            if (isWishlisted) {
                await axios.delete(`http://localhost:5000/api/wishlist/${productId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setIsWishlisted(false);
            } else {
                await axios.post(`http://localhost:5000/api/wishlist/${productId}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setIsWishlisted(true);
            }
            if (onToggle) onToggle();
        } catch (err) {
            console.error('Wishlist toggle failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button 
            onClick={toggleWishlist}
            disabled={loading}
            className={`p-2 rounded-full transition-all duration-300 ${isWishlisted ? 'bg-red-50 text-red-500 scale-110' : 'bg-gray-50 text-gray-400 hover:text-red-400'}`}
        >
            <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
    );
};

export default WishlistButton;
