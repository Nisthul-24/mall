const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    shop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 0 },
    image_url: { type: String, default: '' },
    ratings: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        score: { type: Number, required: true, min: 1, max: 5 }
    }],
    average_rating: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
