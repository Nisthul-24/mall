const pool = require('../config/db');

async function createVotesTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS review_votes (
                id SERIAL PRIMARY KEY,
                review_id INT REFERENCES reviews(id) ON DELETE CASCADE,
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                vote_type INT CHECK (vote_type IN (1, -1)),
                UNIQUE(review_id, user_id)
            );
        `);
        console.log("review_votes table created.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
createVotesTable();
