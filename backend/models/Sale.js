const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity_sold: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sale', saleSchema);
