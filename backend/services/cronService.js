const cron = require('node-cron');
const pool = require('../config/db');

const runBillingSync = async () => {
    console.log('🕒 Running monthly billing sync...');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
        const prevMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);
        
        // 1. Find shops that haven't been billed for the current month
        const { rows: shopsToBill } = await client.query(`
            SELECT id, name, rent_amount, owner_id, performance_rate 
            FROM shops 
            WHERE last_billed_month IS NULL OR last_billed_month < $1
        `, [currentMonth]);
        
        if (shopsToBill.length === 0) {
            console.log('✅ All shops are up to date.');
            await client.query('COMMIT');
            return;
        }

        // 2. Fetch all admin IDs to send notifications
        const { rows: admins } = await client.query("SELECT id FROM users WHERE role = 'admin'");

        for (const shop of shopsToBill) {
            // Calculate Performance Bonus based on previous month sales
            const { rows: salesData } = await client.query(`
                SELECT SUM(p.price * sa.quantity_sold) AS total_sales
                FROM sales sa
                JOIN products p ON sa.product_id = p.id
                WHERE p.shop_id = $1 AND TO_CHAR(sa.date, 'YYYY-MM') = $2
            `, [shop.id, prevMonth]);

            const monthlySales = parseFloat(salesData[0].total_sales || 0);
            const performanceBonus = monthlySales * (shop.performance_rate || 0.05);
            const totalRentForMonth = shop.rent_amount + performanceBonus;

            console.log(`💵 Billing shop: ${shop.name} (Base: ₹${shop.rent_amount} + Performance: ₹${performanceBonus.toFixed(2)})`);
            
            // Increment balance and update billed month
            await client.query(`
                UPDATE shops 
                SET total_balance = total_balance + $1,
                    last_billed_month = $2,
                    rent_status = 'Pending'
                WHERE id = $3
            `, [totalRentForMonth, currentMonth, shop.id]);

            // Notify shop owner
            await client.query(`
                INSERT INTO notifications (user_id, message, type)
                VALUES ($1, $2, 'rent_due')
            `, [shop.owner_id, `Monthly rent of ₹${totalRentForMonth.toFixed(2)} billed (includes performance bonus of ₹${performanceBonus.toFixed(2)}).`]);

            // Notify all admins
            for (const admin of admins) {
                await client.query(`
                    INSERT INTO notifications (user_id, message, type)
                    VALUES ($1, $2, 'admin_alert')
                `, [admin.id, `Rent billed for ${shop.name}: ₹${totalRentForMonth.toFixed(2)}.`]);
            }
        }

        await client.query('COMMIT');
        console.log(`✅ Billing sync completed for ${shopsToBill.length} shops.`);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Billing sync failed:', err);
    } finally {
        client.release();
    }
};

const runPenaltyCheck = async () => {
    console.log('⚖️ Running late fee penalty check...');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Find shops with Pending rent
        const { rows: overdueShops } = await client.query(`
            SELECT id, name, total_balance, owner_id 
            FROM shops 
            WHERE rent_status = 'Pending' AND total_balance > 0
        `);

        for (const shop of overdueShops) {
            const penalty = shop.total_balance * 0.10; // 10% Late Fee
            console.log(`⚠️ Applying penalty to ${shop.name}: ₹${penalty.toFixed(2)}`);

            await client.query(`
                UPDATE shops SET total_balance = total_balance + $1 WHERE id = $2
            `, [penalty, shop.id]);

            await client.query(`
                INSERT INTO notifications (user_id, message, type)
                VALUES ($1, $2, 'rent_due')
            `, [shop.owner_id, `A 10% late fee penalty (₹${penalty.toFixed(2)}) has been added to your balance.`]);
        }

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Penalty check failed:', err);
    } finally {
        client.release();
    }
};

// Schedule: 
// 1. Billing: 00:00 on the 1st of every month
// 2. Penalty: 00:00 on the 10th of every month
const initCron = () => {
    cron.schedule('0 0 1 * *', () => {
        runBillingSync();
    });

    cron.schedule('0 0 10 * *', () => {
        runPenaltyCheck();
    });
    
    // Run sync on startup to catch up
    runBillingSync();
};

module.exports = { initCron, runBillingSync };

