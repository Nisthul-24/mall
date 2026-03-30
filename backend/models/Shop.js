const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
    name: { type: String, required: true },
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    rent_status: { type: String, enum: ['Paid', 'Pending'], default: 'Pending' },
    rent_amount: { type: Number, required: true, default: 1000 },
    rating: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Shop', shopSchema);
