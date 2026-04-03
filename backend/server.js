const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurants');
const dishRoutes = require('./routes/dishes');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const feedbackRoutes = require('./routes/feedback');
const statsRoutes = require('./routes/stats');
const deliveryAuthRoutes = require('./routes/deliveryAuth');
const deliveryRoutes = require('./routes/delivery');
const seedDefaultCatalog = require('./utils/seedDefaultCatalog');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/delivery/auth', deliveryAuthRoutes);
app.use('/api/delivery', deliveryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);

      // Keep manual admin changes persistent by default.
      // Seed runs only with explicit double opt-in to avoid accidental data overwrite.
      const runSeed = String(process.env.RUN_SEED_ON_STARTUP || '').toLowerCase() === 'true';
      const seedSafetyToken = String(process.env.SEED_STARTUP_CONFIRMATION || '');
      if (runSeed && seedSafetyToken === 'I_UNDERSTAND_THIS_WILL_OVERWRITE_DATA') {
        seedDefaultCatalog()
          .then((seedResult) => {
            console.log('Default catalog seeding completed:', seedResult);
          })
          .catch((seedError) => {
            console.error('Default catalog seeding failed:', seedError.message);
          });
      } else {
        console.log(
          'Default catalog seeding skipped (set RUN_SEED_ON_STARTUP=true and ' +
          'SEED_STARTUP_CONFIRMATION=I_UNDERSTAND_THIS_WILL_OVERWRITE_DATA to enable).'
        );
      }
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
