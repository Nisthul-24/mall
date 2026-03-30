require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Shop = require('./models/Shop');
const Product = require('./models/Product');
const Sale = require('./models/Sale');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/abc_mall').then(() => console.log('MongoDB connected for seeding'))
  .catch(err => console.error(err));

const seedDB = async () => {
    try {
        await User.deleteMany({});
        await Shop.deleteMany({});
        await Product.deleteMany({});
        await Sale.deleteMany({});

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('pass', salt);

        // Create Users
        const admin = await User.create({ name: 'Admin User', email: 'admin@mail.com', password: passwordHash, role: 'admin' });
        const customer = await User.create({ name: 'Jane Doe', email: 'cust@mail.com', password: passwordHash, role: 'customer' });

        const owner1 = await User.create({ name: 'Tech Haven Owner', email: 'shop@mail.com', password: passwordHash, role: 'shop_owner' });
        const owner2 = await User.create({ name: 'Boutique Owner', email: 'shop2@mail.com', password: passwordHash, role: 'shop_owner' });
        const owner3 = await User.create({ name: 'Amit Singh', email: 'groceries@mail.com', password: passwordHash, role: 'shop_owner' });
        const owner4 = await User.create({ name: 'Neha Gupta', email: 'books@mail.com', password: passwordHash, role: 'shop_owner' });

        // Create Shops
        const shop1 = await Shop.create({ name: 'Tech Haven', owner_id: owner1._id, status: 'open', rent_status: 'Paid', rent_amount: 15000, rating: 0 });
        const shop2 = await Shop.create({ name: 'Fashion Boutique', owner_id: owner2._id, status: 'open', rent_status: 'Pending', rent_amount: 12000, rating: 0 });
        const shop3 = await Shop.create({ name: 'Fresh Groceries Mart', owner_id: owner3._id, status: 'open', rent_status: 'Paid', rent_amount: 8000, rating: 0 });
        const shop4 = await Shop.create({ name: 'Neha Books Corner', owner_id: owner4._id, status: 'open', rent_status: 'Pending', rent_amount: 5000, rating: 0 });

        // Create Products
        const prod1 = await Product.create({ name: 'Wireless Headphones', shop_id: shop1._id, price: 5999, quantity: 15, image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500' });
        const prod2 = await Product.create({ name: 'Smart Watch', shop_id: shop1._id, price: 12999, quantity: 3, image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500' });
        const prod3 = await Product.create({ name: 'Gaming Mouse', shop_id: shop1._id, price: 1499, quantity: 0, image_url: 'https://images.unsplash.com/photo-1527814050087-379381547926?w=500' });
        const prod1b = await Product.create({ name: '4K Ultra HD Smart TV', shop_id: shop1._id, price: 55000, quantity: 8, image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500' });
        const prod1c = await Product.create({ name: 'Power Bank 20000mAh', shop_id: shop1._id, price: 2500, quantity: 50, image_url: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500' });

        const prod4 = await Product.create({ name: 'Denim Jacket', shop_id: shop2._id, price: 3500, quantity: 20, image_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500' });
        const prod5 = await Product.create({ name: 'Basic T-Shirt', shop_id: shop2._id, price: 599, quantity: 50, image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500' });
        const prod6 = await Product.create({ name: 'Classic Leather Wallet', shop_id: shop2._id, price: 1200, quantity: 30, image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500' });
        const prod7 = await Product.create({ name: 'Running Sneakers', shop_id: shop2._id, price: 4500, quantity: 25, image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500' });

        const prod8 = await Product.create({ name: 'Organic Apples (1kg)', shop_id: shop3._id, price: 250, quantity: 100, image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?w=500' });
        const prod9 = await Product.create({ name: 'Whole Wheat Bread', shop_id: shop3._id, price: 50, quantity: 20, image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500' });
        const prod10 = await Product.create({ name: 'Basmati Rice (5kg)', shop_id: shop3._id, price: 550, quantity: 35, image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500' });
        
        const prod11 = await Product.create({ name: 'The Atomic Habits', shop_id: shop4._id, price: 450, quantity: 40, image_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500' });
        const prod12 = await Product.create({ name: 'Rich Dad Poor Dad', shop_id: shop4._id, price: 399, quantity: 25, image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500' });

        // Create Sales
        await Sale.create({ product_id: prod1._id, quantity_sold: 2, shop_id: shop1._id });
        await Sale.create({ product_id: prod1._id, quantity_sold: 3, shop_id: shop1._id });
        await Sale.create({ product_id: prod2._id, quantity_sold: 1, shop_id: shop1._id });
        await Sale.create({ product_id: prod4._id, quantity_sold: 5, shop_id: shop2._id });

        console.log('Database seeded successfully with expanded INR inventory!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
