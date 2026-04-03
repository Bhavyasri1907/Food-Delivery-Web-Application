const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const DeliveryBoy = require('../models/DeliveryBoy');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register delivery boy
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('city').trim().notEmpty().withMessage('City is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone, city } = req.body;

    let boy = await DeliveryBoy.findOne({ email });
    if (boy) {
      return res.status(400).json({ message: 'Delivery boy already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    boy = new DeliveryBoy({
      name,
      email,
      password: hashedPassword,
      phone,
      city
    });

    await boy.save();

    const token = jwt.sign({ id: boy._id, isDelivery: true }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: boy._id,
        name: boy.name,
        email: boy.email,
        phone: boy.phone,
        city: boy.city,
        available: boy.available,
        role: 'delivery'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login delivery boy
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const boy = await DeliveryBoy.findOne({ email });
    if (!boy) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, boy.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: boy._id, isDelivery: true }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: boy._id,
        name: boy.name,
        email: boy.email,
        phone: boy.phone,
        city: boy.city,
        available: boy.available,
        role: 'delivery'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current delivery boy profile
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isDelivery) {
      return res.status(401).json({ message: 'Not a delivery boy token' });
    }
    const boy = await DeliveryBoy.findById(decoded.id).select('-password');
    if (!boy) {
      return res.status(401).json({ message: 'Delivery boy not found' });
    }
    res.json({
      user: {
        id: boy._id,
        name: boy.name,
        email: boy.email,
        phone: boy.phone,
        city: boy.city,
        available: boy.available,
        role: 'delivery'
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
});

// Update delivery boy profile
router.put('/profile', auth, async (req, res) => {
  try {
    if (req.user.role !== 'delivery') {
      return res.status(403).json({ message: 'Access denied. Delivery only.' });
    }

    const { name, phone, city, password } = req.body;
    const update = {};

    if (typeof name === 'string' && name.trim()) {
      update.name = name.trim();
    }
    if (typeof phone === 'string' && phone.trim()) {
      update.phone = phone.trim();
    }
    if (typeof city === 'string' && city.trim()) {
      update.city = city.trim();
    }

    if (password !== undefined && password !== null && String(password).trim() !== '') {
      const rawPassword = String(password);
      if (rawPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(rawPassword, salt);
    }

    const boy = await DeliveryBoy.findByIdAndUpdate(req.user._id, update, { new: true }).select('-password');
    if (!boy) {
      return res.status(404).json({ message: 'Delivery boy not found' });
    }

    res.json({
      user: {
        id: boy._id,
        name: boy.name,
        email: boy.email,
        phone: boy.phone,
        city: boy.city,
        available: boy.available,
        role: 'delivery'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
