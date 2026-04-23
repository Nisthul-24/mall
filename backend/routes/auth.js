const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        // 1. Raw SQL Check if user exists
        const checkUserQuery = 'SELECT * FROM users WHERE email = $1';
        const { rows: existingUsers } = await pool.query(checkUserQuery, [email]);
        
        if (existingUsers.length > 0) return res.status(400).json({ message: 'User already exists' });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const assignedRole = role === 'admin' || role === 'shop_owner' ? role : 'customer';
        
        // 2. Raw SQL Insert User
        const insertQuery = `
            INSERT INTO users (name, email, password, role) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id, name, email, role
        `;
        const { rows: newUsers } = await pool.query(insertQuery, [name, email, hashedPassword, assignedRole]);
        const newUser = newUsers[0];
        
        res.status(201).json({ 
            message: 'User registered successfully', 
            user: newUser 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 1. Raw SQL Find user by email
        const userQuery = 'SELECT * FROM users WHERE email = $1';
        const { rows: users } = await pool.query(userQuery, [email]);
        
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });
        const user = users[0];
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
        
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'supersecretkey_for_abc_mall', { expiresIn: '1d' });
        
        // Exclude password from returning user object natively
        res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email }});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
