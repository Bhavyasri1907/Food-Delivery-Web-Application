const express = require('express');
const Dish = require('../models/Dish');
const Restaurant = require('../models/Restaurant');
const { auth, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

function normalizeDishName(name) {
  return String(name || '').trim().toLowerCase();
}

// Get dishes by category (with optional city filter)
router.get('/by-category', async (req, res) => {
  try {
    const { category, city } = req.query;
    const filter = { available: true };
    if (category) filter.category = category;

    let dishes;
    if (city) {
      // Find restaurants in that city first
      const cityRestaurants = await Restaurant.find({ city }).select('_id');
      const restaurantIds = cityRestaurants.map(r => r._id);
      filter.restaurant = { $in: restaurantIds };
    }

    dishes = await Dish.find(filter).populate('restaurant', 'name city image hiddenDishNames');
    const visibleDishes = dishes.filter((dish) => {
      const hiddenNames = Array.isArray(dish.restaurant?.hiddenDishNames)
        ? dish.restaurant.hiddenDishNames.map(normalizeDishName)
        : [];
      return !hiddenNames.includes(normalizeDishName(dish.name));
    });
    res.json(visibleDishes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get dishes by restaurant
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId).select('hiddenDishNames');
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const hiddenNameSet = new Set(
      Array.isArray(restaurant.hiddenDishNames)
        ? restaurant.hiddenDishNames.map(normalizeDishName)
        : []
    );
    const dishes = await Dish.find({ restaurant: req.params.restaurantId });
    const visibleDishes = dishes.filter((dish) => !hiddenNameSet.has(normalizeDishName(dish.name)));
    res.json(visibleDishes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single dish
router.get('/:id', async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id).populate('restaurant', 'name city');
    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' });
    }
    res.json(dish);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Add dish
router.post('/', auth, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const { name, category, price, available, restaurant, image: imageUrl } = req.body;

    // Verify target restaurant exists
    const rest = await Restaurant.findById(restaurant);
    if (!rest) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const sanitizedImageUrl = typeof imageUrl === 'string' ? imageUrl.trim() : imageUrl;
    const image = req.file ? `/uploads/${req.file.filename}` : (sanitizedImageUrl || '');
    const normalizedName = normalizeDishName(name);
    if (normalizedName) {
      rest.hiddenDishNames = (rest.hiddenDishNames || []).filter(
        (hiddenName) => hiddenName !== normalizedName
      );
      await rest.save();
    }

    const dish = new Dish({
      name,
      category,
      price: parseFloat(price),
      image,
      available: available !== 'false',
      restaurant
    });

    await dish.save();
    res.status(201).json(dish);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Update dish
router.put('/:id', auth, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' });
    }

    const rest = await Restaurant.findById(dish.restaurant);
    if (!rest) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const { name, category, price, available, image: imageUrl } = req.body;
    if (name) dish.name = name;
    if (category) dish.category = category;
    if (price) dish.price = parseFloat(price);
    if (available !== undefined) dish.available = available !== 'false';
    if (req.file) dish.image = `/uploads/${req.file.filename}`;
    else if (imageUrl !== undefined) dish.image = typeof imageUrl === 'string' ? imageUrl.trim() : imageUrl;

    if (name) {
      const normalizedName = normalizeDishName(name);
      if (normalizedName) {
        rest.hiddenDishNames = (rest.hiddenDishNames || []).filter(
          (hiddenName) => hiddenName !== normalizedName
        );
      }
    }

    await Promise.all([dish.save(), rest.save()]);
    res.json(dish);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Delete dish
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' });
    }

    const rest = await Restaurant.findById(dish.restaurant);
    if (!rest) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const normalizedName = normalizeDishName(dish.name);
    if (normalizedName && !(rest.hiddenDishNames || []).includes(normalizedName)) {
      rest.hiddenDishNames = [...(rest.hiddenDishNames || []), normalizedName];
    }

    await Promise.all([Dish.findByIdAndDelete(req.params.id), rest.save()]);
    res.json({ message: 'Dish deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

