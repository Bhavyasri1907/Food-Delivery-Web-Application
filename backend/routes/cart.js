const express = require('express');
const Cart = require('../models/Cart');
const { auth, customerOnly } = require('../middleware/auth');

const router = express.Router();

async function getHydratedCart(cartId) {
  const populated = await Cart.findById(cartId)
    .populate('restaurant', 'name city')
    .populate('items.dish', 'image updatedAt');

  if (!populated) return { items: [], restaurant: null };

  const obj = populated.toObject();
  obj.items = (obj.items || []).map((item) => {
    const dishDoc = item.dish && typeof item.dish === 'object' ? item.dish : null;
    return {
      ...item,
      image: dishDoc?.image || item.image || '',
      dishUpdatedAt: dishDoc?.updatedAt || null,
      dish: dishDoc?._id || item.dish
    };
  });

  return obj;
}

// Get cart
router.get('/', auth, customerOnly, async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.user._id }).select('_id');
    if (!cart) return res.json({ items: [], restaurant: null });
    const hydrated = await getHydratedCart(cart._id);
    res.json(hydrated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add item to cart
router.post('/add', auth, customerOnly, async (req, res) => {
  try {
    const { dishId, name, price, image, restaurant } = req.body;

    let cart = await Cart.findOne({ customer: req.user._id });

    if (!cart) {
      cart = new Cart({
        customer: req.user._id,
        restaurant,
        items: []
      });
    }

    // If adding from different restaurant, clear cart
    if (cart.restaurant && cart.restaurant.toString() !== restaurant) {
      cart.items = [];
      cart.restaurant = restaurant;
    }

    const existingItem = cart.items.find(item => item.dish.toString() === dishId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.items.push({ dish: dishId, name, price, image, quantity: 1 });
    }

    cart.restaurant = restaurant;
    await cart.save();

    const hydrated = await getHydratedCart(cart._id);
    res.json(hydrated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update item quantity
router.put('/update', auth, customerOnly, async (req, res) => {
  try {
    const { dishId, quantity } = req.body;
    const cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(item => item.dish.toString() !== dishId);
    } else {
      const item = cart.items.find(item => item.dish.toString() === dishId);
      if (item) {
        item.quantity = quantity;
      }
    }

    if (cart.items.length === 0) {
      cart.restaurant = null;
    }

    await cart.save();
    const hydrated = await getHydratedCart(cart._id);
    res.json(hydrated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove item from cart
router.delete('/remove/:dishId', auth, customerOnly, async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.dish.toString() !== req.params.dishId);
    if (cart.items.length === 0) {
      cart.restaurant = null;
    }

    await cart.save();
    const hydrated = await getHydratedCart(cart._id);
    res.json(hydrated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Clear cart
router.delete('/clear', auth, customerOnly, async (req, res) => {
  try {
    await Cart.findOneAndDelete({ customer: req.user._id });
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
