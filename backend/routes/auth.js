const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Ensure roles are strictly assigned (if not admin creating another role)
        // Public registration should default to 'customer'
        const assignedRole = role === 'admin' || role === 'shop_owner' ? role : 'customer';
        
        const newUser = new User({ name, email, password: hashedPassword, role: assignedRole });
        await newUser.save();
        res.status(201).json({ 
            message: 'User registered successfully', 
            user: { _id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role } 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
        
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'supersecretkey_for_abc_mall', { expiresIn: '1d' });
        
        res.json({ token, user: { id: user._id, name: user.name, role: user.role, email: user.email }});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
