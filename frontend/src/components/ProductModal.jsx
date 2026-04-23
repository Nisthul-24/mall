import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Star, ImageIcon, Send, Clock, User } from 'lucide-react';
import Card from './Card';

const ProductModal = ({ product, isOpen, onClose }) => {
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ score: 5, comment: '', image_url: '' });
    const [submitting, setSubmitting] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (isOpen && product) {
            fetchReviews();
        }
    }, [isOpen, product]);

    const fetchReviews = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/reviews/product/${product.id}`);
            setReviews(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!token) return alert('Login required to review');
        setSubmitting(true);
        try {
            await axios.post('http://localhost:5000/api/reviews', {
                product_id: product.id,
                score: newReview.score,
                comment: newReview.comment,
                review_image_url: newReview.image_url
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewReview({ score: 5, comment: '', image_url: '' });
            fetchReviews();
        } catch (err) {
            alert('Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative scale-in-center">
                <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white rounded-full shadow-md text-gray-800 transition-all">
                    <X className="h-6 w-6" />
                </button>

                {/* Left side - Product Image */}
                <div className="md:w-1/2 bg-gray-50 flex items-center justify-center">
                    <img src={product.image_url} alt={product.name} className="max-h-full max-w-full object-contain" />
                </div>

                {/* Right side - Info & Reviews */}
                <div className="md:w-1/2 p-6 overflow-y-auto flex flex-col">
                    <div className="mb-6">
                        <div className="text-xs font-bold text-blue-600 uppercase mb-1">{product.category}</div>
                        <h2 className="text-3xl font-black text-gray-900 leading-tight mb-2">{product.name}</h2>
                        <p className="text-2xl font-bold text-gray-900 mb-2">₹{product.price.toLocaleString('en-IN')}</p>
                        <div className="flex items-center gap-2">
                             <div className="flex text-yellow-400">
                                <Star className="h-5 w-5 fill-current" />
                             </div>
                             <span className="text-lg font-bold text-gray-700">{product.average_rating || 0}</span>
                             <span className="text-gray-400 font-medium">({reviews.length} reviews)</span>
                        </div>
                    </div>

                    <div className="space-y-6 flex-grow">
                        {/* Review Form */}
                        {token && (
                            <form onSubmit={handleSubmitReview} className="p-4 bg-gray-50 rounded-xl space-y-4 border border-gray-100">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold text-gray-800">Add Review</h4>
                                    <div className="flex gap-1">
                                        {[1,2,3,4,5].map(s => (
                                            <Star 
                                                key={s} 
                                                className={`h-5 w-5 cursor-pointer ${s <= newReview.score ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                                onClick={() => setNewReview({...newReview, score: s})}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <textarea 
                                    className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition h-20"
                                    placeholder="Write your feedback..."
                                    required
                                    value={newReview.comment}
                                    onChange={e => setNewReview({...newReview, comment: e.target.value})}
                                />
                                <div className="flex gap-2">
                                    <div className="relative flex-grow">
                                        <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Review Image URL (optional)" 
                                            className="w-full pl-9 pr-4 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 transition"
                                            value={newReview.image_url}
                                            onChange={e => setNewReview({...newReview, image_url: e.target.value})}
                                        />
                                    </div>
                                    <button disabled={submitting} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50 min-w-[40px]">
                                        <Send className="h-4 w-4" />
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Reviews List */}
                        <div className="space-y-4 pb-4">
                            <h4 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" /> Customer Reviews
                            </h4>
                            {reviews.length > 0 ? reviews.map(rev => (
                                <div key={rev.id} className="space-y-2 py-2 border-b last:border-0 border-gray-100">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-gray-800 text-sm">{rev.user_name}</span>
                                        <div className="flex gap-0.5 text-yellow-400">
                                            {[...Array(rev.score)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed italic">"{rev.comment}"</p>
                                    {rev.review_image_url && (
                                        <div className="h-24 w-24 rounded-lg overflow-hidden border">
                                            <img src={rev.review_image_url} alt="Review" className="h-full w-full object-cover" />
                                        </div>
                                    )}
                                    <div className="flex items-center text-[10px] text-gray-400 gap-1 mt-1">
                                        <Clock className="h-3 w-3" />
                                        {new Date(rev.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8 text-gray-400 italic text-sm">No reviews yet. Be the first to review!</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;
