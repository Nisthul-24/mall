const pool = require('../config/db');

async function runUpdates() {
    const client = await pool.connect();
    try {
        console.log('Updating existing product descriptions...');
        
        // 1. Update existing products
        const existingDesc = {
            'Wireless Headphones': 'Premium noise-canceling wireless headphones with 40 hours of battery life and immersive sound quality. Perfect for music lovers and professionals.',
            'Smart Watch': 'Next-generation smartwatch featuring heart rate monitoring, GPS tracking, and a stunning AMOLED display. Water-resistant up to 50 meters.',
            'Gaming Mouse': 'Ergonomic gaming mouse with customizable RGB lighting, programmable buttons, and an ultra-fast sensor for competitive gaming.',
            '4K Ultra HD Smart TV': 'Experience cinematic brilliance with this 55-inch 4K Ultra HD Smart TV. Enjoy vivid colors, deep blacks, and seamless streaming apps.',
            'Power Bank 20000mAh': 'High-capacity 20000mAh power bank capable of charging your smartphone up to 5 times. Features dual USB outputs and fast charging.',
            'Denim Jacket': 'Classic vintage-wash denim jacket for a timeless look. Durable, comfortable, and perfect for layering in any season.',
            'Basic T-Shirt': 'Ultra-soft 100% cotton crewneck t-shirt. Breathable and durable for everyday casual wear.',
            'Classic Leather Wallet': 'Handcrafted genuine leather bifold wallet with RFID blocking technology, featuring 6 card slots and a spacious bill compartment.',
            'Running Sneakers': 'Lightweight running sneakers with advanced shock absorption and a breathable mesh upper for peak athletic performance.',
            'Organic Apples (1kg)': 'Freshly picked, crisp, and sweet organic apples sourced directly from local farms. Perfect for snacking or baking.',
            'Whole Wheat Bread': 'Freshly baked whole wheat bread rich in dietary fiber. No artificial preservatives added.',
            'Basmati Rice (5kg)': 'Premium long-grain Basmati rice known for its distinct aroma and fluffy texture. Essential for biryani and pulav.',
            'The Atomic Habits': 'A proven framework for improving every day by James Clear. Learn how to build good habits and break bad ones.',
            'Rich Dad Poor Dad': 'Robert Kiyosaki’s classic personal finance book on wealth-building, investing, and the mindset needed for financial independence.'
        };

        for (const [name, desc] of Object.entries(existingDesc)) {
            await client.query('UPDATE products SET description = $1 WHERE name = $2', [desc, name]);
        }
        
        console.log('Descriptions updated.');

        // 2. Create new shops
        console.log('Creating new shops...');
        // First we need owner IDs. We'll just reuse the first shop owner we can find, or create a new user.
        // Let's create a new shop owner if we need to, or use existing 'shop_owner' role.
        const { rows: owners } = await client.query("SELECT id FROM users WHERE role = 'shop_owner' LIMIT 1");
        const ownerId = owners[0].id;

        const { rows: newShops } = await client.query(`
            INSERT INTO shops (name, owner_id, status, rent_status, rent_amount, rating) VALUES
            ('Fitness Pro Gear', $1, 'open', 'Paid', 14000, 0),
            ('Home Essentials', $1, 'open', 'Pending', 9500, 0)
            RETURNING id, name
        `, [ownerId]);

        const fitnessShopId = newShops.find(s => s.name === 'Fitness Pro Gear').id;
        const homeShopId = newShops.find(s => s.name === 'Home Essentials').id;
        
        console.log('New shops added.');

        // 3. Add new products with descriptions
        console.log('Adding new products...');
        await client.query(`
            INSERT INTO products (name, shop_id, price, quantity, image_url, category, description, average_rating) VALUES
            ('Yoga Mat 6mm', $1, 899, 45, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500', 'Fitness', 'Eco-friendly 6mm thick yoga mat with non-slip texture for superior grip and comfort during workouts.', 0),
            ('Adjustable Dumbbells Set', $1, 4500, 12, 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=500', 'Fitness', 'Space-saving adjustable dumbbells allowing you to switch weights easily from 2kg to 15kg.', 0),
            ('Protein Powder Vanilla', $1, 2800, 30, 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500', 'Fitness', 'High-quality whey protein isolate. 25g of protein per serving with a delicious vanilla flavor.', 0),
            
            ('Ceramic Coffee Mug Set', $2, 650, 60, 'https://images.unsplash.com/photo-1481833759220-e2213e9a4f47?w=500', 'Home', 'Set of 4 elegant ceramic coffee mugs. Microwave safe and perfect for morning coffee or evening tea.', 0),
            ('Aromatherapy Diffuser', $2, 1200, 25, 'https://images.unsplash.com/photo-1608528577891-eb055944f2e7?w=500', 'Home', 'Ultrasonic essential oil diffuser with 7 ambient light colors and auto shut-off function.', 0),
            ('Cotton Bed Sheets', $2, 1800, 40, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500', 'Home', 'Luxurious 400-thread-count 100% pure cotton bed sheet set including 1 flat sheet and 2 pillowcases.', 0)
        `, [fitnessShopId, homeShopId]);

        console.log('New products added successfully.');
        process.exit(0);

    } catch (err) {
        console.error('Error during updates:', err);
        process.exit(1);
    } finally {
        client.release();
    }
}

runUpdates();
