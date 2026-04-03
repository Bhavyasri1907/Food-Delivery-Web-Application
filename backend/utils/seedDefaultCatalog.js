const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Dish = require('../models/Dish');

const SEED_OWNER_EMAIL = 'seed.admin@fda.local';
const SEED_OWNER_PASSWORD = 'SeedAdmin@123';
const SEED_OWNER_NAME = 'Catalog Admin';

const TARGET_CITIES = [
  'Kakinada',
  'Rajahmundry',
  'Hyderabad',
  'Mumbai',
  'Kolkata',
  'Delhi'
];

const DEFAULT_RESTAURANT_BRANDS = [
  { name: 'Spice Route', description: 'Popular for biryanis, starters, fast food, beverages, and desserts.' },
  { name: 'Royal Tandoor', description: 'Family-style restaurant serving thalis, tiffins, kebabs, and cakes.' },
  { name: 'Coastal Kitchen', description: 'Balanced menu with biryanis, veg meals, snacks, and ice creams.' },
  { name: 'Urban Tiffins', description: 'Comfort meals and tiffins with quick snacks and cool beverages.' },
  { name: 'Biryani Palace', description: 'Signature biryanis with starters, fast foods, and dessert combos.' }
];

const KAKINADA_RESTAURANTS = [
  { name: 'Sri Krishna Punjabi Dhaba', description: 'Popular for Punjabi curries, rotis, and family meals.' },
  { name: 'Chittimutyalu', description: 'Well-known for authentic Andhra-style meals and local flavors.' },
  { name: 'Lassi Shop', description: 'Refreshing lassi, beverages, and quick snacks.' },
  { name: 'Subbaiah Gari Hotel', description: 'Traditional Andhra meals served in classic style.' },
  { name: 'Fresh Choice', description: 'Fresh food options with quick service and quality ingredients.' }
];

const RAJAHMUNDRY_RESTAURANTS = [
  { name: 'Kritunga', description: 'Known for spicy Andhra and Rayalaseema-style dishes.' },
  { name: 'KFC', description: 'Global fried chicken and fast-food chain.' },
  { name: 'Subway', description: 'Popular sandwiches, salads, and quick bites.' },
  { name: 'The Red Box', description: 'Casual spot for Chinese and Indo-Chinese dishes.' },
  { name: 'Fresh Choice - Patisserie, Bakery & Cafe', description: 'Bakery cafe for cakes, pastries, and snacks.' }
];

const HYDERABAD_RESTAURANTS = [
  { name: 'Domino\'s Pizza', description: 'Global pizza chain with popular veg and non-veg pizzas, sides, and desserts.' },
  { name: 'Paradise Biryani', description: 'Legendary Hyderabad restaurant known for Dum Biryani and kebabs.' },
  { name: 'Bawarchi', description: 'Famous Hyderabad biryani spot with rich Mughlai and Andhra flavors.' },
  { name: 'Shah Ghouse', description: 'Iconic Hyderabadi restaurant known for biryani, kebabs, and haleem.' },
  { name: 'Chutneys', description: 'Popular South Indian restaurant known for dosas, idli, and chutneys.' }
];

const MUMBAI_RESTAURANTS = [
  { name: 'Leopold Cafe', description: 'Historic Mumbai cafe known for continental, Indian, and Chinese dishes.' },
  { name: 'Bademiya', description: 'Legendary Mumbai kebab and rolls restaurant.' },
  { name: 'Trishna', description: 'Famous seafood restaurant known for coastal specialties.' },
  { name: 'Cafe Madras', description: 'Iconic Matunga eatery popular for South Indian breakfast and tiffins.' },
  { name: 'The Bombay Canteen', description: 'Popular modern Indian restaurant with regional favorites.' }
];

const KOLKATA_RESTAURANTS = [
  { name: 'Arsalan', description: 'Iconic Kolkata restaurant known for biryani and kebabs.' },
  { name: 'Peter Cat', description: 'Famous Park Street restaurant known for Chelo Kebab.' },
  { name: 'Flurys', description: 'Classic Kolkata patisserie known for cakes and bakery dishes.' },
  { name: '6 Ballygunge Place', description: 'Popular Bengali restaurant with traditional specialties.' },
  { name: 'Bhojohori Manna', description: 'Famous Bengali chain known for homestyle regional food.' }
];

const DELHI_RESTAURANTS = [
  { name: 'McDonald\'s', description: 'Global burger and fries chain with quick meals and beverages.' },
  { name: 'Karim\'s', description: 'Iconic Old Delhi Mughlai restaurant known for kebabs and curries.' },
  { name: 'Bikanervala', description: 'Popular North Indian vegetarian restaurant and sweets chain.' },
  { name: 'Haldiram\'s', description: 'Famous Indian vegetarian restaurant with chaat and thali options.' },
  { name: 'Sagar Ratna', description: 'Well-known South Indian restaurant chain for tiffins and meals.' }
];

const SPECIAL_NONVEG_RESTAURANTS = new Set([
  'sri krishna punjabi dhaba',
  'chittimutyalu'
]);
const SPECIAL_LASSI_RESTAURANTS = new Set([
  'lassi shop'
]);
const SPECIAL_VEG_TIFFIN_RESTAURANTS = new Set([
  'subbaiah gari hotel'
]);
const SPECIAL_DESSERT_RESTAURANTS = new Set([
  'fresh choice'
]);
const SPECIAL_RAJAHMUNDRY_RESTAURANTS = new Set([
  'kritunga',
  'kfc',
  'subway',
  'the red box',
  'fresh choice',
  'fresh choice - patisserie, bakery & cafe'
]);
const SPECIAL_DELHI_RESTAURANTS = new Set([
  'mcdonald\'s',
  'karim\'s',
  'bikanervala',
  'haldiram\'s',
  'sagar ratna'
]);
const SPECIAL_HYDERABAD_RESTAURANTS = new Set([
  'domino\'s pizza',
  'paradise biryani',
  'bawarchi',
  'shah ghouse',
  'chutneys'
]);
const SPECIAL_MUMBAI_RESTAURANTS = new Set([
  'leopold cafe',
  'bademiya',
  'trishna',
  'cafe madras',
  'the bombay canteen'
]);
const SPECIAL_KOLKATA_RESTAURANTS = new Set([
  'arsalan',
  'peter cat',
  'flurys',
  '6 ballygunge place',
  'bhojohori manna'
]);
const DISH_IMAGE_CACHE = new Map();

const NONVEG_DISH_TEMPLATES = [
  { name: 'Chicken Dum Biryani', category: 'Biryani', price: 289 },
  { name: 'Mutton Dum Biryani', category: 'Biryani', price: 349 },
  { name: 'Prawns Biryani', category: 'Biryani', price: 369 },
  { name: 'Fish Biryani', category: 'Biryani', price: 329 },
  { name: 'Egg Biryani', category: 'Biryani', price: 219 },
  { name: 'Chicken Fry Piece Biryani', category: 'Biryani', price: 299 },
  { name: 'Chicken Tikka Biryani', category: 'Biryani', price: 319 },
  { name: 'Keema Biryani', category: 'Biryani', price: 309 },
  { name: 'Chicken 65 Biryani', category: 'Biryani', price: 309 },
  { name: 'Mutton Keema Biryani', category: 'Biryani', price: 359 },
  { name: 'Chicken Majestic', category: 'Snacks', price: 249 },
  { name: 'Chicken 65', category: 'Snacks', price: 229 },
  { name: 'Dragon Chicken', category: 'Snacks', price: 239 },
  { name: 'Apollo Fish', category: 'Snacks', price: 269 },
  { name: 'Chilli Chicken', category: 'Snacks', price: 229 },
  { name: 'Pepper Chicken', category: 'Snacks', price: 239 },
  { name: 'Chicken Lollipop', category: 'Snacks', price: 249 },
  { name: 'Tandoori Chicken Full', category: 'Snacks', price: 419 },
  { name: 'Spicy Chicken Wings', category: 'Snacks', price: 239 },
  { name: 'Mutton Seekh Kebab', category: 'Snacks', price: 279 },
  { name: 'Mutton Pepper Fry', category: 'Snacks', price: 309 },
  { name: 'Prawns Fry', category: 'Snacks', price: 319 },
  { name: 'Fish Fry', category: 'Snacks', price: 299 },
  { name: 'Crab Masala', category: 'Snacks', price: 349 },
  { name: 'Chicken Manchurian', category: 'Snacks', price: 229 },
  { name: 'Chicken Hakka Noodles', category: 'Fast Food', price: 219 },
  { name: 'Chicken Fried Rice', category: 'Fast Food', price: 229 },
  { name: 'Egg Fried Rice', category: 'Fast Food', price: 189 },
  { name: 'Chicken Shawarma', category: 'Fast Food', price: 179 },
  { name: 'Chicken Burger', category: 'Fast Food', price: 169 },
  { name: 'Chicken Wrap', category: 'Fast Food', price: 179 },
  { name: 'Chicken Pizza', category: 'Fast Food', price: 259 },
  { name: 'Grilled Chicken Breast', category: 'Fast Food', price: 279 },
  { name: 'Butter Chicken', category: 'Meals', price: 279 },
  { name: 'Chicken Curry', category: 'Meals', price: 249 },
  { name: 'Mutton Curry', category: 'Meals', price: 309 },
  { name: 'Fish Curry', category: 'Meals', price: 289 },
  { name: 'Prawns Curry', category: 'Meals', price: 319 },
  { name: 'Chicken Keema Curry', category: 'Meals', price: 269 },
  { name: 'Gongura Chicken', category: 'Meals', price: 279 },
  { name: 'Natu Kodi Pulusu', category: 'Meals', price: 289 },
  { name: 'Chicken Kebab Roll', category: 'Fast Food', price: 189 },
  { name: 'Chicken Pakora', category: 'Snacks', price: 219 },
  { name: 'Mutton Bone Soup', category: 'Meals', price: 169 },
  { name: 'Chicken Clear Soup', category: 'Meals', price: 149 },
  { name: 'Chicken Haleem', category: 'Meals', price: 249 },
  { name: 'Egg Omelette', category: 'Meals', price: 99 },
  { name: 'Chicken Sandwich', category: 'Fast Food', price: 149 },
  { name: 'Chicken Hot Dog', category: 'Fast Food', price: 159 },
  { name: 'Non Veg Special Thali', category: 'Meals', price: 329 }
];

const LASSI_SHOP_DISH_TEMPLATES = [
  { name: 'Coca Cola 300ml', category: 'Beverages', price: 49, image: 'https://wallpapers.com/images/hd/coca-cola-5oo8i79x5mxrb9tc.jpg' },
  { name: 'Diet Coke 300ml', category: 'Beverages', price: 49, image: 'https://loremflickr.com/1200/800/diet-cola,soft-drink?lock=9502' },
  { name: 'Coke Zero 300ml', category: 'Beverages', price: 49, image: 'https://loremflickr.com/1200/800/zero-sugar-cola,soft-drink?lock=9503' },
  { name: 'Pepsi 300ml', category: 'Beverages', price: 49, image: 'https://www.eatthis.com/wp-content/uploads/sites/4/2023/02/pepsi-can-bottle-ice.jpg?quality=82&strip=all' },
  { name: 'Pepsi Black 300ml', category: 'Beverages', price: 49, image: 'https://loremflickr.com/1200/800/black-cola,soft-drink?lock=9505' },
  { name: 'Sprite 300ml', category: 'Beverages', price: 49, image: 'https://loremflickr.com/1200/800/lemon-lime-soda,soft-drink?lock=9506' },
  { name: 'Fanta Orange 300ml', category: 'Beverages', price: 49, image: 'https://source.unsplash.com/1200x800/?fanta,orange,soda' },
  { name: 'Limca 300ml', category: 'Beverages', price: 49, image: 'https://loremflickr.com/1200/800/lime-soda,soft-drink?lock=9508' },
  { name: 'Thums Up 300ml', category: 'Beverages', price: 49, image: 'https://source.unsplash.com/1200x800/?thums-up,cola,bottle' },
  { name: 'Mountain Dew 300ml', category: 'Beverages', price: 49, image: 'https://loremflickr.com/1200/800/citrus-soda,drink?lock=9510' },
  { name: '7UP 300ml', category: 'Beverages', price: 49, image: 'https://loremflickr.com/1200/800/soda,lime?lock=9511' },
  { name: 'Mirinda Orange 300ml', category: 'Beverages', price: 49, image: 'https://loremflickr.com/1200/800/orange-soda,bottle?lock=9512' },
  { name: 'Ginger Ale', category: 'Beverages', price: 59, image: 'https://loremflickr.com/1200/800/ginger-ale,drink?lock=9513' },
  { name: 'Soda Water', category: 'Beverages', price: 39, image: 'https://source.unsplash.com/1200x800/?soda-water,sparkling-water,glass' },
  { name: 'Fresh Orange Juice', category: 'Beverages', price: 89, image: 'https://loremflickr.com/1200/800/orange-juice,fresh?lock=9515' },
  { name: 'Sweet Lime Juice', category: 'Beverages', price: 89, image: 'https://loremflickr.com/1200/800/sweet-lime-juice,glass?lock=9516' },
  { name: 'Watermelon Juice', category: 'Beverages', price: 99, image: 'https://loremflickr.com/1200/800/watermelon-juice,fresh?lock=9517' },
  { name: 'Pineapple Juice', category: 'Beverages', price: 99, image: 'https://loremflickr.com/1200/800/pineapple-juice,drink?lock=9518' },
  { name: 'Mango Juice', category: 'Beverages', price: 109, image: 'https://loremflickr.com/1200/800/mango-juice,fresh?lock=9519' },
  { name: 'Grape Juice', category: 'Beverages', price: 99, image: 'https://loremflickr.com/1200/800/grape-juice,glass?lock=9520' },
  { name: 'Pomegranate Juice', category: 'Beverages', price: 119, image: 'https://loremflickr.com/1200/800/pomegranate-juice,fresh?lock=9521' },
  { name: 'Apple Juice', category: 'Beverages', price: 99, image: 'https://loremflickr.com/1200/800/apple-juice,drink?lock=9522' },
  { name: 'Banana Honey Juice', category: 'Beverages', price: 109, image: 'https://loremflickr.com/1200/800/banana-juice,drink?lock=9523' },
  { name: 'Papaya Juice', category: 'Beverages', price: 99, image: 'https://loremflickr.com/1200/800/papaya-juice,fresh?lock=9524' },
  { name: 'Mosambi Mint Juice', category: 'Beverages', price: 99, image: 'https://source.unsplash.com/1200x800/?mosambi,sweet-lime,juice,mint' },
  { name: 'Mixed Fruit Juice', category: 'Beverages', price: 119, image: 'https://loremflickr.com/1200/800/mixed-fruit-juice,glass?lock=9526' },
  { name: 'Carrot Beetroot Juice', category: 'Beverages', price: 109, image: 'https://loremflickr.com/1200/800/carrot-juice,beetroot?lock=9527' },
  { name: 'ABC Detox Juice', category: 'Beverages', price: 119, image: 'https://loremflickr.com/1200/800/detox-juice,healthy-drink?lock=9528' },
  { name: 'Virgin Mojito', category: 'Beverages', price: 129, image: 'https://loremflickr.com/1200/800/virgin-mojito,mocktail?lock=9529' },
  { name: 'Blue Lagoon Mocktail', category: 'Beverages', price: 139, image: 'https://loremflickr.com/1200/800/blue-lagoon,mocktail?lock=9530' },
  { name: 'Green Apple Fizz', category: 'Beverages', price: 129, image: 'https://loremflickr.com/1200/800/green-apple-mocktail,fizz?lock=9531' },
  { name: 'Cranberry Sparkler', category: 'Beverages', price: 129, image: 'https://loremflickr.com/1200/800/cranberry-mocktail,sparkling?lock=9532' },
  { name: 'Watermelon Mint Cooler', category: 'Beverages', price: 129, image: 'https://loremflickr.com/1200/800/watermelon-cooler,mint?lock=9533' },
  { name: 'Kiwi Lemonade', category: 'Beverages', price: 129, image: 'https://loremflickr.com/1200/800/kiwi-lemonade,mocktail?lock=9534' },
  { name: 'Pineapple Ginger Cooler', category: 'Beverages', price: 129, image: 'https://loremflickr.com/1200/800/pineapple-cooler,ginger?lock=9535' },
  { name: 'Fruit Punch Mocktail', category: 'Beverages', price: 139, image: 'https://loremflickr.com/1200/800/fruit-punch,mocktail?lock=9536' },
  { name: 'Strawberry Basil Cooler', category: 'Beverages', price: 139, image: 'https://source.unsplash.com/1200x800/?strawberry,basil,cooler,mocktail' },
  { name: 'Cucumber Cooler', category: 'Beverages', price: 119, image: 'https://source.unsplash.com/1200x800/?cucumber,cooler,mocktail' },
  { name: 'Cola Mint Twist', category: 'Beverages', price: 119, image: 'https://loremflickr.com/1200/800/cola-mocktail,mint?lock=9540' },
  { name: 'Classic Vanilla Milkshake', category: 'Beverages', price: 149, image: 'https://source.unsplash.com/1200x800/?classic-vanilla-milkshake&sig=101' },
  { name: 'Chocolate Milkshake', category: 'Beverages', price: 159, image: 'https://source.unsplash.com/1200x800/?chocolate-milkshake&sig=102' },
  { name: 'Strawberry Milkshake', category: 'Beverages', price: 159, image: 'https://source.unsplash.com/1200x800/?strawberry-milkshake&sig=103' },
  { name: 'Mango Milkshake', category: 'Beverages', price: 159, image: 'https://source.unsplash.com/1200x800/?mango-milkshake&sig=104' },
  { name: 'Oreo Milkshake', category: 'Beverages', price: 169, image: 'https://thesaltymarshmallow.com/wp-content/uploads/2018/08/oreo-milkshakes1.jpg' },
  { name: 'Butterscotch Milkshake', category: 'Beverages', price: 169, image: 'https://source.unsplash.com/1200x800/?butterscotch-milkshake&sig=106' },
  { name: 'Banana Milkshake', category: 'Beverages', price: 149, image: 'https://source.unsplash.com/1200x800/?banana,milkshake' },
  { name: 'Dry Fruit Milkshake', category: 'Beverages', price: 179, image: 'https://source.unsplash.com/1200x800/?dry-fruit-milkshake&sig=108' },
  { name: 'Rose Milkshake', category: 'Beverages', price: 149, image: 'https://source.unsplash.com/1200x800/?rose,milkshake' },
  { name: 'Kesar Pista Milkshake', category: 'Beverages', price: 189, image: 'https://source.unsplash.com/1200x800/?kesar-pista-milkshake&sig=110' }
];

const SUBBAIAH_VEG_DISH_TEMPLATES = [
  { name: 'Idli (2 Pcs)', category: 'Meals', price: 49, image: 'https://source.unsplash.com/1200x800/?idli,sambar' },
  { name: 'Ghee Idli', category: 'Meals', price: 69, image: 'https://source.unsplash.com/1200x800/?ghee,idli' },
  { name: 'Rava Idli', category: 'Meals', price: 69, image: 'https://source.unsplash.com/1200x800/?rava,idli' },
  { name: 'Medu Vada (2 Pcs)', category: 'Meals', price: 59, image: 'https://source.unsplash.com/1200x800/?medu-vada,sambar' },
  { name: 'Sambar Vada', category: 'Meals', price: 69, image: 'https://source.unsplash.com/1200x800/?sambar-vada' },
  { name: 'Plain Dosa', category: 'Meals', price: 69, image: 'https://source.unsplash.com/1200x800/?plain,dosa' },
  { name: 'Masala Dosa', category: 'Meals', price: 89, image: 'https://source.unsplash.com/1200x800/?masala,dosa' },
  { name: 'Ghee Karam Dosa', category: 'Meals', price: 99, image: 'https://source.unsplash.com/1200x800/?ghee,karam,dosa' },
  { name: 'Onion Dosa', category: 'Meals', price: 89, image: 'https://tse1.mm.bing.net/th/id/OIP.SQF-9saMrejN8g1ByALCHQHaGP?pid=Api&P=0&h=180' },
  { name: 'Pesarattu', category: 'Meals', price: 99, image: 'https://source.unsplash.com/1200x800/?pesarattu' },
  { name: 'Upma Pesarattu', category: 'Meals', price: 119, image: 'https://source.unsplash.com/1200x800/?upma,pesarattu' },
  { name: 'Rava Dosa', category: 'Meals', price: 99, image: 'https://source.unsplash.com/1200x800/?rava,dosa' },
  { name: 'Pongal', category: 'Meals', price: 89, image: 'https://source.unsplash.com/1200x800/?ven-pongal' },
  { name: 'Poori with Aloo Curry', category: 'Meals', price: 89, image: 'https://image.freepik.com/free-photo/poori-masala-curry-aloo-sabzi-puri_466689-77533.jpg?w=2000' },
  { name: 'Uttapam', category: 'Meals', price: 99, image: 'https://source.unsplash.com/1200x800/?uttapam' },
  { name: 'Vegetable Upma', category: 'Meals', price: 79, image: 'https://source.unsplash.com/1200x800/?upma,vegetable' },
  { name: 'Tomato Bath', category: 'Meals', price: 89, image: 'https://source.unsplash.com/1200x800/?tomato,bath,rice' },
  { name: 'Curd Rice', category: 'Meals', price: 79, image: 'https://source.unsplash.com/1200x800/?curd-rice' },
  { name: 'Lemon Rice', category: 'Meals', price: 79, image: 'https://source.unsplash.com/1200x800/?lemon-rice' },
  { name: 'Vegetable Meals', category: 'Meals', price: 149, image: 'https://source.unsplash.com/1200x800/?south-indian,veg-thali' },
  { name: 'Sambar Rice', category: 'Meals', price: 99, image: 'https://source.unsplash.com/1200x800/?sambar-rice' },
  { name: 'Rasam Rice', category: 'Meals', price: 99, image: 'https://source.unsplash.com/1200x800/?rasam-rice' },
  { name: 'Vegetable Biryani', category: 'Biryani', price: 149, image: 'https://source.unsplash.com/1200x800/?vegetable,biryani' },
  { name: 'Paneer Biryani', category: 'Biryani', price: 179, image: 'https://source.unsplash.com/1200x800/?paneer,biryani' },
  { name: 'Veg Fried Rice', category: 'Fast Food', price: 139, image: 'https://source.unsplash.com/1200x800/?veg,fried-rice' },
  { name: 'Veg Noodles', category: 'Fast Food', price: 139, image: 'https://source.unsplash.com/1200x800/?veg,noodles' },
  { name: 'Gobi Manchurian', category: 'Snacks', price: 149, image: 'https://source.unsplash.com/1200x800/?gobi,manchurian' },
  { name: 'Paneer Butter Masala', category: 'Meals', price: 199, image: 'https://source.unsplash.com/1200x800/?paneer,butter-masala' },
  { name: 'Mixed Veg Curry', category: 'Meals', price: 169, image: 'https://source.unsplash.com/1200x800/?mixed-veg,curry' }
];

const FRESH_CHOICE_DESSERT_TEMPLATES = [
  { name: 'Chocolate Cake', category: 'Desserts', price: 159 },
  { name: 'Black Forest Cake', category: 'Desserts', price: 169 },
  { name: 'Red Velvet Cake', category: 'Desserts', price: 179 },
  { name: 'Butterscotch Cake', category: 'Desserts', price: 169 },
  { name: 'Vanilla Pastry', category: 'Desserts', price: 99 },
  { name: 'Chocolate Pastry', category: 'Desserts', price: 109 },
  { name: 'Strawberry Ice Cream', category: 'Desserts', price: 89 },
  { name: 'Vanilla Ice Cream', category: 'Desserts', price: 79 },
  { name: 'Chocolate Ice Cream', category: 'Desserts', price: 89 },
  { name: 'Butterscotch Ice Cream', category: 'Desserts', price: 89 },
  { name: 'Mango Ice Cream', category: 'Desserts', price: 89 },
  { name: 'Fruit Salad with Ice Cream', category: 'Desserts', price: 129 },
  { name: 'Brownie with Ice Cream', category: 'Desserts', price: 149 },
  { name: 'Gulab Jamun with Ice Cream', category: 'Desserts', price: 129 },
  { name: 'Kulfi Falooda', category: 'Desserts', price: 139 }
];

const RAJAHMUNDRY_DISH_TEMPLATES = [
  { name: 'Chicken Biryani', category: 'Biryani', price: 249 },
  { name: 'Veg Biryani', category: 'Biryani', price: 199 },
  { name: 'Paneer Butter Masala', category: 'Meals', price: 229 },
  { name: 'Butter Naan', category: 'Meals', price: 49 },
  { name: 'Chicken 65', category: 'Snacks', price: 199 },
  { name: 'Gobi Manchurian', category: 'Snacks', price: 169 },
  { name: 'Veg Fried Rice', category: 'Fast Food', price: 159 },
  { name: 'Chicken Fried Rice', category: 'Fast Food', price: 189 },
  { name: 'Veg Noodles', category: 'Fast Food', price: 149 },
  { name: 'Chicken Noodles', category: 'Fast Food', price: 179 },
  { name: 'Idli Sambar', category: 'Meals', price: 79 },
  { name: 'Masala Dosa', category: 'Meals', price: 109 },
  { name: 'Chocolate Cake Slice', category: 'Desserts', price: 129 },
  { name: 'Vanilla Ice Cream', category: 'Desserts', price: 89 },
  { name: 'Lime Soda', category: 'Beverages', price: 79 }
];

const KFC_DISH_TEMPLATES = [
  { name: 'Hot & Crispy Chicken - 1 Pc', category: 'Snacks', price: 129 },
  { name: 'Hot & Crispy Chicken - 2 Pc', category: 'Snacks', price: 239 },
  { name: 'Smoky Red Chicken - 2 Pc', category: 'Snacks', price: 249 },
  { name: 'Chicken Drumsticks - 2 Pc', category: 'Snacks', price: 229 },
  { name: 'Chicken Drumsticks - 4 Pc', category: 'Snacks', price: 429 },
  { name: 'Chicken Popcorn - Regular', category: 'Snacks', price: 149 },
  { name: 'Chicken Popcorn - Large', category: 'Snacks', price: 269 },
  { name: 'Peri Peri Chicken Strips - 3 Pc', category: 'Snacks', price: 199 },
  { name: 'Classic Chicken Zinger Burger', category: 'Fast Food', price: 199 },
  { name: 'Chicken Krisper Burger', category: 'Fast Food', price: 149 },
  { name: 'Chicken Longer', category: 'Fast Food', price: 129 },
  { name: 'Ultimate Savings Bucket', category: 'Meals', price: 699 },
  { name: 'Big 8 Chicken Bucket', category: 'Meals', price: 619 },
  { name: 'French Fries - Regular', category: 'Snacks', price: 109 },
  { name: 'Pepsi 475ml', category: 'Beverages', price: 99 }
];

const SUBWAY_DISH_TEMPLATES = [
  { name: 'Spicy Chicken Keema Sandwich', category: 'Fast Food', price: 349 },
  { name: 'Chicken Tikka Achari Meal', category: 'Meals', price: 379 },
  { name: 'Great American BBQ Meal', category: 'Meals', price: 399 },
  { name: 'Roast Chicken Sandwich', category: 'Fast Food', price: 329 },
  { name: 'Veggie Delite Sandwich', category: 'Fast Food', price: 279 },
  { name: 'Paneer Achari Sandwich', category: 'Fast Food', price: 319 },
  { name: 'Chilli Cheese Sandwich', category: 'Fast Food', price: 299 },
  { name: 'Crunchy Mexican Sandwich', category: 'Fast Food', price: 299 },
  { name: 'Chicken Tikka Wrap', category: 'Fast Food', price: 289 },
  { name: 'Veggie Delite Wrap', category: 'Fast Food', price: 259 },
  { name: 'Chicken Keema Salad', category: 'Meals', price: 279 },
  { name: 'Veggie Salad Bowl', category: 'Meals', price: 239 },
  { name: 'Dark Chunk Chocolate Cookie', category: 'Desserts', price: 75 },
  { name: 'Pepsi 475ml', category: 'Beverages', price: 99 }
];

const RED_BOX_DISH_TEMPLATES = [
  { name: 'Egg Fried Rice', category: 'Fast Food', price: 209 },
  { name: 'Chicken Hakka Noodles', category: 'Fast Food', price: 249 },
  { name: 'Hot & Sour Pepper Veg Soup', category: 'Meals', price: 199 },
  { name: 'Veg Manchow Soup', category: 'Meals', price: 199 },
  { name: 'Veg Lung Fung Soup', category: 'Meals', price: 199 },
  { name: 'Thai Chilli Paneer', category: 'Snacks', price: 299 },
  { name: 'Apollo Fish', category: 'Snacks', price: 299 },
  { name: 'Cantonese Fried Chicken', category: 'Snacks', price: 279 },
  { name: 'Chilli Egg', category: 'Snacks', price: 209 },
  { name: 'Schezwan Egg', category: 'Snacks', price: 209 },
  { name: 'Spicy Fried Chicken', category: 'Snacks', price: 279 },
  { name: 'Spicy Fried Prawn', category: 'Snacks', price: 299 },
  { name: 'Thai Chilli Fish', category: 'Snacks', price: 309 },
  { name: 'Chicken Manchurian', category: 'Snacks', price: 299 },
  { name: 'Chilli Chicken', category: 'Snacks', price: 299 },
  { name: 'Dragon Chicken', category: 'Snacks', price: 299 },
  { name: 'Lollipop Chicken', category: 'Snacks', price: 299 },
  { name: 'Red Chicken', category: 'Snacks', price: 299 },
  { name: 'Masala Lemonade', category: 'Beverages', price: 99 }
];

const FRESH_CHOICE_RAJAHMUNDRY_DISH_TEMPLATES = [
  { name: 'Chocolate Truffle Cake', category: 'Desserts', price: 565 },
  { name: 'Vanilla Cake', category: 'Desserts', price: 440 },
  { name: 'Choco Mocha Cake', category: 'Desserts', price: 625 },
  { name: 'Choco Pista Cake', category: 'Desserts', price: 565 },
  { name: 'Red Velvet Cake', category: 'Desserts', price: 625 },
  { name: 'White Forest Cake', category: 'Desserts', price: 700 },
  { name: 'Chocolate Nutella Cake', category: 'Desserts', price: 815 },
  { name: 'Chocolate Kitkat Cake', category: 'Desserts', price: 750 },
  { name: 'Chocolate Hazelnut Cake', category: 'Desserts', price: 815 },
  { name: 'Chocolate Symphony Cake', category: 'Desserts', price: 750 },
  { name: 'Chocolate Snicker Cake', category: 'Desserts', price: 815 },
  { name: 'German Chocolate Cake', category: 'Desserts', price: 815 },
  { name: 'Pineapple Cake', category: 'Desserts', price: 700 },
  { name: 'Butterscotch Cake', category: 'Desserts', price: 720 },
  { name: 'Black Forest Cake', category: 'Desserts', price: 720 },
  { name: 'Chocolate Mousse Cake', category: 'Desserts', price: 1200 },
  { name: 'Chocolate Mud Cake', category: 'Desserts', price: 1080 },
  { name: 'Blueberry Cake', category: 'Desserts', price: 1020 },
  { name: 'Honey Almond Cake', category: 'Desserts', price: 1000 },
  { name: 'Coffee Hazelnut Cake', category: 'Desserts', price: 2750 }
];

const DELHI_MCDONALDS_DISH_TEMPLATES = [
  { name: 'McAloo Tikki Burger', category: 'Fast Food', price: 69 },
  { name: 'McSpicy Chicken Burger', category: 'Fast Food', price: 219 },
  { name: 'McChicken Burger', category: 'Fast Food', price: 159 },
  { name: 'Chicken Maharaja Mac', category: 'Fast Food', price: 299 },
  { name: 'Veg Maharaja Mac', category: 'Fast Food', price: 269 },
  { name: 'Chicken Nuggets - 6 Pc', category: 'Snacks', price: 189 },
  { name: 'French Fries - Medium', category: 'Snacks', price: 119 },
  { name: 'McVeggie Burger', category: 'Fast Food', price: 169 },
  { name: 'Coke Float', category: 'Beverages', price: 109 },
  { name: 'McFlurry Oreo', category: 'Desserts', price: 129 }
];

const DELHI_KARIMS_DISH_TEMPLATES = [
  { name: 'Mutton Korma', category: 'Meals', price: 429 },
  { name: 'Chicken Jahangiri', category: 'Meals', price: 359 },
  { name: 'Chicken Burra', category: 'Snacks', price: 389 },
  { name: 'Mutton Seekh Kebab', category: 'Snacks', price: 329 },
  { name: 'Chicken Seekh Kebab', category: 'Snacks', price: 299 },
  { name: 'Chicken Biryani', category: 'Biryani', price: 299 },
  { name: 'Mutton Biryani', category: 'Biryani', price: 369 },
  { name: 'Shahi Tukda', category: 'Desserts', price: 159 },
  { name: 'Roomali Roti', category: 'Meals', price: 39 },
  { name: 'Chicken Korma', category: 'Meals', price: 339 }
];

const DELHI_BIKANERVALA_DISH_TEMPLATES = [
  { name: 'Raj Kachori', category: 'Snacks', price: 149 },
  { name: 'Chole Bhature', category: 'Meals', price: 199 },
  { name: 'Pav Bhaji', category: 'Meals', price: 189 },
  { name: 'Paneer Tikka', category: 'Snacks', price: 269 },
  { name: 'Dal Makhani', category: 'Meals', price: 249 },
  { name: 'Paneer Butter Masala', category: 'Meals', price: 269 },
  { name: 'Veg Thali', category: 'Meals', price: 289 },
  { name: 'Masala Dosa', category: 'Meals', price: 179 },
  { name: 'Rasgulla (2 Pcs)', category: 'Desserts', price: 99 },
  { name: 'Gulab Jamun (2 Pcs)', category: 'Desserts', price: 99 }
];

const DELHI_HALDIRAMS_DISH_TEMPLATES = [
  { name: 'Papdi Chaat', category: 'Snacks', price: 139 },
  { name: 'Aloo Tikki Chaat', category: 'Snacks', price: 129 },
  { name: 'Rajma Chawal', category: 'Meals', price: 189 },
  { name: 'Chole Bhature', category: 'Meals', price: 199 },
  { name: 'Dahi Bhalla', category: 'Snacks', price: 139 },
  { name: 'Paneer Lababdar', category: 'Meals', price: 279 },
  { name: 'Veg Biryani', category: 'Biryani', price: 229 },
  { name: 'South Indian Platter', category: 'Meals', price: 249 },
  { name: 'Rasmalai (2 Pcs)', category: 'Desserts', price: 119 },
  { name: 'Masala Chaas', category: 'Beverages', price: 69 }
];

const DELHI_SAGAR_RATNA_DISH_TEMPLATES = [
  { name: 'Idli Sambar', category: 'Meals', price: 129 },
  { name: 'Medu Vada', category: 'Meals', price: 139 },
  { name: 'Masala Dosa', category: 'Meals', price: 189 },
  { name: 'Rava Dosa', category: 'Meals', price: 199 },
  { name: 'Mysore Masala Dosa', category: 'Meals', price: 219 },
  { name: 'Pongal', category: 'Meals', price: 169 },
  { name: 'Lemon Rice', category: 'Meals', price: 169 },
  { name: 'Curd Rice', category: 'Meals', price: 159 },
  { name: 'Filter Coffee', category: 'Beverages', price: 79 },
  { name: 'Mini Tiffin', category: 'Meals', price: 249 }
];

const HYDERABAD_DOMINOS_DISH_TEMPLATES = [
  { name: 'Margherita Pizza', category: 'Fast Food', price: 239 },
  { name: 'Farmhouse Pizza', category: 'Fast Food', price: 459 },
  { name: 'Peppy Paneer Pizza', category: 'Fast Food', price: 459 },
  { name: 'Veg Extravaganza Pizza', category: 'Fast Food', price: 529 },
  { name: 'Chicken Dominator Pizza', category: 'Fast Food', price: 639 },
  { name: 'Pepper Barbecue Chicken Pizza', category: 'Fast Food', price: 529 },
  { name: 'Indi Tandoori Paneer Pizza', category: 'Fast Food', price: 549 },
  { name: 'Chicken Sausage Pizza', category: 'Fast Food', price: 499 },
  { name: 'Taco Mexicana Veg Pizza', category: 'Fast Food', price: 549 },
  { name: 'Garlic Breadsticks', category: 'Snacks', price: 169 },
  { name: 'Stuffed Garlic Bread', category: 'Snacks', price: 229 },
  { name: 'Chicken Wings', category: 'Snacks', price: 289 },
  { name: 'Choco Lava Cake', category: 'Desserts', price: 129 },
  { name: 'Butterscotch Mousse Cake', category: 'Desserts', price: 139 },
  { name: 'Pepsi 475ml', category: 'Beverages', price: 79 }
];

const HYDERABAD_PARADISE_DISH_TEMPLATES = [
  { name: 'Chicken Dum Biryani', category: 'Biryani', price: 329 },
  { name: 'Mutton Biryani', category: 'Biryani', price: 429 },
  { name: 'Prawns Biryani', category: 'Biryani', price: 469 },
  { name: 'Paneer Biryani', category: 'Biryani', price: 299 },
  { name: 'Veg Biryani', category: 'Biryani', price: 269 },
  { name: 'Chicken 65', category: 'Snacks', price: 279 },
  { name: 'Chicken Tikka Kebab', category: 'Snacks', price: 319 },
  { name: 'Mutton Seekh Kebab', category: 'Snacks', price: 359 },
  { name: 'Apollo Fish', category: 'Snacks', price: 349 },
  { name: 'Butter Chicken', category: 'Meals', price: 339 },
  { name: 'Kadai Chicken', category: 'Meals', price: 329 },
  { name: 'Paneer Butter Masala', category: 'Meals', price: 299 },
  { name: 'Hyderabadi Marag Soup', category: 'Meals', price: 209 },
  { name: 'Double Ka Meetha', category: 'Desserts', price: 169 },
  { name: 'Qubani Ka Meetha', category: 'Desserts', price: 189 }
];

const HYDERABAD_BAWARCHI_DISH_TEMPLATES = [
  { name: 'Special Chicken Biryani', category: 'Biryani', price: 329 },
  { name: 'Mutton Dum Biryani', category: 'Biryani', price: 429 },
  { name: 'Egg Biryani', category: 'Biryani', price: 249 },
  { name: 'Chicken Fry Piece Biryani', category: 'Biryani', price: 359 },
  { name: 'Chicken Tikka Biryani', category: 'Biryani', price: 379 },
  { name: 'Chicken 65', category: 'Snacks', price: 269 },
  { name: 'Dragon Chicken', category: 'Snacks', price: 289 },
  { name: 'Chicken Lollipop', category: 'Snacks', price: 299 },
  { name: 'Apollo Fish', category: 'Snacks', price: 339 },
  { name: 'Pepper Chicken', category: 'Snacks', price: 309 },
  { name: 'Chicken Manchurian', category: 'Snacks', price: 289 },
  { name: 'Mutton Curry', category: 'Meals', price: 359 },
  { name: 'Butter Naan', category: 'Meals', price: 59 },
  { name: 'Raita', category: 'Meals', price: 59 },
  { name: 'Gulab Jamun', category: 'Desserts', price: 129 }
];

const HYDERABAD_SHAH_GHOUSE_DISH_TEMPLATES = [
  { name: 'Special Chicken Biryani', category: 'Biryani', price: 339 },
  { name: 'Mutton Biryani', category: 'Biryani', price: 439 },
  { name: 'Chicken Family Pack Biryani', category: 'Biryani', price: 749 },
  { name: 'Haleem', category: 'Meals', price: 249 },
  { name: 'Chicken 65', category: 'Snacks', price: 279 },
  { name: 'Talawa Gosht', category: 'Snacks', price: 349 },
  { name: 'Mutton Seekh Kebab', category: 'Snacks', price: 369 },
  { name: 'Chicken Tikka', category: 'Snacks', price: 319 },
  { name: 'Pathar Ka Gosht', category: 'Snacks', price: 399 },
  { name: 'Nihari', category: 'Meals', price: 329 },
  { name: 'Mutton Korma', category: 'Meals', price: 359 },
  { name: 'Chicken Curry', category: 'Meals', price: 329 },
  { name: 'Khubani Ka Meetha', category: 'Desserts', price: 189 },
  { name: 'Firni', category: 'Desserts', price: 149 },
  { name: 'Lassi', category: 'Beverages', price: 99 }
];

const HYDERABAD_CHUTNEYS_DISH_TEMPLATES = [
  { name: 'Idli Sambar', category: 'Meals', price: 129 },
  { name: 'Ghee Idli', category: 'Meals', price: 149 },
  { name: 'Medu Vada', category: 'Meals', price: 139 },
  { name: 'Pongal', category: 'Meals', price: 169 },
  { name: 'Masala Dosa', category: 'Meals', price: 199 },
  { name: 'Rava Dosa', category: 'Meals', price: 209 },
  { name: 'Ghee Podi Dosa', category: 'Meals', price: 219 },
  { name: 'Onion Uttapam', category: 'Meals', price: 199 },
  { name: 'Curd Rice', category: 'Meals', price: 169 },
  { name: 'Lemon Rice', category: 'Meals', price: 169 },
  { name: 'Tomato Rice', category: 'Meals', price: 179 },
  { name: 'Mini Meals', category: 'Meals', price: 239 },
  { name: 'Filter Coffee', category: 'Beverages', price: 89 },
  { name: 'Badam Milk', category: 'Beverages', price: 109 },
  { name: 'Kesari Bath', category: 'Desserts', price: 129 }
];

const MUMBAI_LEOPOLD_DISH_TEMPLATES = [
  { name: 'Chicken Tikka', category: 'Snacks', price: 339 },
  { name: 'Butter Chicken', category: 'Meals', price: 389 },
  { name: 'Chicken Biryani', category: 'Biryani', price: 349 },
  { name: 'Mutton Rogan Josh', category: 'Meals', price: 429 },
  { name: 'Paneer Butter Masala', category: 'Meals', price: 319 },
  { name: 'Veg Manchurian', category: 'Snacks', price: 259 },
  { name: 'Chicken Fried Rice', category: 'Fast Food', price: 289 },
  { name: 'Fish and Chips', category: 'Fast Food', price: 399 },
  { name: 'Chicken Caesar Salad', category: 'Meals', price: 299 },
  { name: 'Prawn Curry Rice', category: 'Meals', price: 429 },
  { name: 'Masala Omelette', category: 'Meals', price: 189 },
  { name: 'Garlic Naan', category: 'Meals', price: 79 },
  { name: 'Caramel Custard', category: 'Desserts', price: 189 },
  { name: 'Fresh Lime Soda', category: 'Beverages', price: 119 },
  { name: 'Cold Coffee', category: 'Beverages', price: 169 }
];

const MUMBAI_BADEMIYA_DISH_TEMPLATES = [
  { name: 'Chicken Seekh Kebab Roll', category: 'Fast Food', price: 249 },
  { name: 'Mutton Seekh Kebab Roll', category: 'Fast Food', price: 289 },
  { name: 'Chicken Tikka Roll', category: 'Fast Food', price: 269 },
  { name: 'Bheja Roll', category: 'Fast Food', price: 279 },
  { name: 'Reshmi Kebab', category: 'Snacks', price: 349 },
  { name: 'Chicken Boti Kebab', category: 'Snacks', price: 339 },
  { name: 'Mutton Boti Kebab', category: 'Snacks', price: 379 },
  { name: 'Chicken Malai Tikka', category: 'Snacks', price: 349 },
  { name: 'Chicken Bhuna', category: 'Meals', price: 359 },
  { name: 'Mutton Bhuna', category: 'Meals', price: 419 },
  { name: 'Chicken Biryani', category: 'Biryani', price: 339 },
  { name: 'Keema Pav', category: 'Meals', price: 259 },
  { name: 'Roomali Roti', category: 'Meals', price: 39 },
  { name: 'Phirni', category: 'Desserts', price: 149 },
  { name: 'Masala Cola', category: 'Beverages', price: 99 }
];

const MUMBAI_TRISHNA_DISH_TEMPLATES = [
  { name: 'Butter Garlic Crab', category: 'Snacks', price: 1099 },
  { name: 'Pomfret Tandoori', category: 'Snacks', price: 699 },
  { name: 'Prawns Koliwada', category: 'Snacks', price: 629 },
  { name: 'Bombay Duck Fry', category: 'Snacks', price: 449 },
  { name: 'Surmai Fry', category: 'Snacks', price: 589 },
  { name: 'Crab Masala', category: 'Meals', price: 899 },
  { name: 'Prawn Curry', category: 'Meals', price: 649 },
  { name: 'Fish Curry Rice', category: 'Meals', price: 529 },
  { name: 'Mutton Sukka', category: 'Meals', price: 549 },
  { name: 'Chicken Ghee Roast', category: 'Meals', price: 499 },
  { name: 'Neer Dosa', category: 'Meals', price: 139 },
  { name: 'Appam', category: 'Meals', price: 129 },
  { name: 'Steamed Rice', category: 'Meals', price: 129 },
  { name: 'Sol Kadhi', category: 'Beverages', price: 129 },
  { name: 'Caramel Custard', category: 'Desserts', price: 179 }
];

const MUMBAI_CAFE_MADRAS_DISH_TEMPLATES = [
  { name: 'Idli Sambar', category: 'Meals', price: 99 },
  { name: 'Medu Vada', category: 'Meals', price: 109 },
  { name: 'Sambar Vada', category: 'Meals', price: 119 },
  { name: 'Plain Dosa', category: 'Meals', price: 119 },
  { name: 'Masala Dosa', category: 'Meals', price: 149 },
  { name: 'Rava Dosa', category: 'Meals', price: 169 },
  { name: 'Mysore Masala Dosa', category: 'Meals', price: 179 },
  { name: 'Pongal', category: 'Meals', price: 139 },
  { name: 'Upma', category: 'Meals', price: 129 },
  { name: 'Podi Idli', category: 'Meals', price: 139 },
  { name: 'Curd Rice', category: 'Meals', price: 129 },
  { name: 'Lemon Rice', category: 'Meals', price: 129 },
  { name: 'Filter Coffee', category: 'Beverages', price: 69 },
  { name: 'Badam Milk', category: 'Beverages', price: 99 },
  { name: 'Kesari Bath', category: 'Desserts', price: 109 }
];

const MUMBAI_BOMBAY_CANTEEN_DISH_TEMPLATES = [
  { name: 'Keema Pao', category: 'Meals', price: 329 },
  { name: 'Vada Pao Sliders', category: 'Snacks', price: 289 },
  { name: 'Paneer Khurchan Kulcha', category: 'Meals', price: 339 },
  { name: 'Mutton Cutlet', category: 'Snacks', price: 359 },
  { name: 'Chicken Berry Pulao', category: 'Biryani', price: 399 },
  { name: 'Jackfruit Biryani', category: 'Biryani', price: 349 },
  { name: 'Koliwada Fish Tacos', category: 'Fast Food', price: 379 },
  { name: 'Gunpowder Potatoes', category: 'Snacks', price: 249 },
  { name: 'Malwani Chicken Curry', category: 'Meals', price: 389 },
  { name: 'Paneer Tikka', category: 'Snacks', price: 319 },
  { name: 'Dal Tadka', category: 'Meals', price: 249 },
  { name: 'Butter Naan', category: 'Meals', price: 69 },
  { name: 'Baked Gulab Jamun Cheesecake', category: 'Desserts', price: 229 },
  { name: 'Kokum Sharbat', category: 'Beverages', price: 139 },
  { name: 'Masala Chaas', category: 'Beverages', price: 99 }
];

const KOLKATA_ARSALAN_DISH_TEMPLATES = [
  { name: 'Mutton Biryani', category: 'Biryani', price: 359 },
  { name: 'Chicken Biryani', category: 'Biryani', price: 299 },
  { name: 'Special Mutton Biryani', category: 'Biryani', price: 429 },
  { name: 'Chicken Chaap', category: 'Meals', price: 299 },
  { name: 'Mutton Chaap', category: 'Meals', price: 359 },
  { name: 'Chicken Rezala', category: 'Meals', price: 319 },
  { name: 'Mutton Rezala', category: 'Meals', price: 389 },
  { name: 'Chicken Kebab', category: 'Snacks', price: 279 },
  { name: 'Mutton Seekh Kebab', category: 'Snacks', price: 319 },
  { name: 'Tangdi Kebab', category: 'Snacks', price: 299 },
  { name: 'Chicken Bharta', category: 'Meals', price: 299 },
  { name: 'Firni', category: 'Desserts', price: 129 },
  { name: 'Raita', category: 'Meals', price: 69 },
  { name: 'Roomali Roti', category: 'Meals', price: 35 },
  { name: 'Soft Drink', category: 'Beverages', price: 59 }
];

const KOLKATA_PETER_CAT_DISH_TEMPLATES = [
  { name: 'Chelo Kebab', category: 'Meals', price: 529 },
  { name: 'Chicken Steak Sizzler', category: 'Meals', price: 499 },
  { name: 'Mutton Steak Sizzler', category: 'Meals', price: 559 },
  { name: 'Fish Florentine', category: 'Meals', price: 469 },
  { name: 'Chicken A La Kiev', category: 'Meals', price: 459 },
  { name: 'Devilled Crab', category: 'Snacks', price: 429 },
  { name: 'Prawn Cocktail', category: 'Snacks', price: 389 },
  { name: 'Chicken Tetrazzini', category: 'Meals', price: 439 },
  { name: 'Grilled Fish', category: 'Meals', price: 479 },
  { name: 'Chicken Shashlik', category: 'Snacks', price: 399 },
  { name: 'Mutton Chops', category: 'Snacks', price: 459 },
  { name: 'Mushroom on Toast', category: 'Snacks', price: 289 },
  { name: 'Baked Alaska', category: 'Desserts', price: 249 },
  { name: 'Lemonade', category: 'Beverages', price: 119 },
  { name: 'Cold Coffee', category: 'Beverages', price: 169 }
];

const KOLKATA_FLURYS_DISH_TEMPLATES = [
  { name: 'English Breakfast', category: 'Meals', price: 399 },
  { name: 'Chicken Sandwich', category: 'Fast Food', price: 249 },
  { name: 'Veg Club Sandwich', category: 'Fast Food', price: 229 },
  { name: 'Chicken Quiche', category: 'Snacks', price: 259 },
  { name: 'Mushroom Quiche', category: 'Snacks', price: 239 },
  { name: 'Chicken Puff', category: 'Snacks', price: 139 },
  { name: 'Veg Puff', category: 'Snacks', price: 119 },
  { name: 'Chicken Sausage Roll', category: 'Snacks', price: 169 },
  { name: 'Chocolate Truffle Pastry', category: 'Desserts', price: 189 },
  { name: 'Black Forest Pastry', category: 'Desserts', price: 179 },
  { name: 'Red Velvet Pastry', category: 'Desserts', price: 199 },
  { name: 'Blueberry Cheesecake', category: 'Desserts', price: 239 },
  { name: 'Croissant', category: 'Desserts', price: 149 },
  { name: 'Cafe Latte', category: 'Beverages', price: 169 },
  { name: 'Hot Chocolate', category: 'Beverages', price: 179 }
];

const KOLKATA_BALLYGUNGE_DISH_TEMPLATES = [
  { name: 'Kosha Mangsho', category: 'Meals', price: 379 },
  { name: 'Bhetki Paturi', category: 'Meals', price: 429 },
  { name: 'Chingri Malai Curry', category: 'Meals', price: 459 },
  { name: 'Shorshe Ilish', category: 'Meals', price: 499 },
  { name: 'Doi Katla', category: 'Meals', price: 399 },
  { name: 'Mochar Chop', category: 'Snacks', price: 189 },
  { name: 'Luchi Aloor Dum', category: 'Meals', price: 229 },
  { name: 'Basanti Pulao', category: 'Meals', price: 249 },
  { name: 'Cholar Dal', category: 'Meals', price: 169 },
  { name: 'Begun Bhaja', category: 'Snacks', price: 149 },
  { name: 'Mutton Dakbungalow', category: 'Meals', price: 439 },
  { name: 'Chicken Dakbungalow', category: 'Meals', price: 369 },
  { name: 'Mishti Doi', category: 'Desserts', price: 129 },
  { name: 'Rosogolla', category: 'Desserts', price: 119 },
  { name: 'Aam Porar Shorbot', category: 'Beverages', price: 129 }
];

const KOLKATA_BHOJOHORI_DISH_TEMPLATES = [
  { name: 'Mutton Kosha', category: 'Meals', price: 369 },
  { name: 'Chicken Kosha', category: 'Meals', price: 319 },
  { name: 'Bhetki Fry', category: 'Snacks', price: 339 },
  { name: 'Fish Kabiraji', category: 'Snacks', price: 319 },
  { name: 'Mutton Dak Bungalow', category: 'Meals', price: 429 },
  { name: 'Dimer Devil', category: 'Snacks', price: 189 },
  { name: 'Chingri Malai Curry', category: 'Meals', price: 449 },
  { name: 'Pabda Jhal', category: 'Meals', price: 389 },
  { name: 'Shukto', category: 'Meals', price: 179 },
  { name: 'Alu Posto', category: 'Meals', price: 169 },
  { name: 'Luchi', category: 'Meals', price: 99 },
  { name: 'Steamed Rice', category: 'Meals', price: 119 },
  { name: 'Mishti Doi', category: 'Desserts', price: 129 },
  { name: 'Patishapta', category: 'Desserts', price: 149 },
  { name: 'Gondhoraj Lemonade', category: 'Beverages', price: 139 }
];

const FRESH_CHOICE_IMAGE_OVERRIDES = {
  'chocolate truffle cake': 'https://tse4.mm.bing.net/th/id/OIP.5_qsvbzDuc-jut3AOHt-BAHaHa?pid=Api&P=0&h=180',
  'vanilla cake': 'https://source.unsplash.com/1200x800/?vanilla-cake,food&sig=7101',
  'choco mocha cake': 'https://source.unsplash.com/1200x800/?mocha,chocolate,cake,food&sig=7003',
  'choco pista cake': 'https://source.unsplash.com/1200x800/?pistachio,chocolate,cake,food&sig=7004',
  'red velvet cake': 'https://source.unsplash.com/1200x800/?red-velvet,cake,food&sig=7005',
  'white forest cake': 'https://source.unsplash.com/1200x800/?white-forest,cake,food&sig=7006',
  'chocolate nutella cake': 'https://source.unsplash.com/1200x800/?nutella,cake,food&sig=7102',
  'chocolate kitkat cake': 'https://source.unsplash.com/1200x800/?kitkat,chocolate,cake,food&sig=7008',
  'chocolate hazelnut cake': 'https://source.unsplash.com/1200x800/?hazelnut,chocolate,cake,food&sig=7009',
  'chocolate symphony cake': 'https://source.unsplash.com/1200x800/?chocolate,cake,dessert,food&sig=7010',
  'chocolate snicker cake': 'https://source.unsplash.com/1200x800/?snickers,chocolate,cake,food&sig=7011',
  'german chocolate cake': 'https://source.unsplash.com/1200x800/?german,chocolate,cake,food&sig=7012',
  'pineapple cake': 'https://source.unsplash.com/1200x800/?pineapple,cake,food&sig=7103',
  'butterscotch cake': 'https://source.unsplash.com/1200x800/?butterscotch,cake,food&sig=7014',
  'black forest cake': 'https://source.unsplash.com/1200x800/?black-forest,cake,food&sig=7015',
  'chocolate mousse cake': 'https://source.unsplash.com/1200x800/?chocolate,mousse,cake,food&sig=7104',
  'chocolate mud cake': 'https://source.unsplash.com/1200x800/?chocolate,mud-cake,food&sig=7105',
  'blueberry cake': 'https://source.unsplash.com/1200x800/?blueberry,cake,food&sig=7106'
  ,
  'honey almond cake': 'https://source.unsplash.com/1200x800/?honey,almond,cake,food&sig=7019',
  'coffee hazelnut cake': 'https://source.unsplash.com/1200x800/?coffee,hazelnut,cake,food&sig=7020'
};

async function ensureSeedOwner() {
  let user = await User.findOne({ email: SEED_OWNER_EMAIL });
  if (user) return user;

  const hashedPassword = await bcrypt.hash(SEED_OWNER_PASSWORD, 10);
  user = await User.create({
    name: SEED_OWNER_NAME,
    email: SEED_OWNER_EMAIL,
    password: hashedPassword,
    role: 'admin'
  });

  return user;
}

function getRestaurantName(city, brandName) {
  return `${city} ${brandName}`;
}

function getTargetRestaurants() {
  const targets = [];

  for (const city of TARGET_CITIES) {
    if (city.toLowerCase() === 'kakinada') {
      for (const rest of KAKINADA_RESTAURANTS) {
        targets.push({ city, name: rest.name, description: rest.description });
      }
      continue;
    }
    if (city.toLowerCase() === 'rajahmundry') {
      for (const rest of RAJAHMUNDRY_RESTAURANTS) {
        targets.push({ city, name: rest.name, description: rest.description });
      }
      continue;
    }
    if (city.toLowerCase() === 'hyderabad') {
      for (const rest of HYDERABAD_RESTAURANTS) {
        targets.push({ city, name: rest.name, description: rest.description });
      }
      continue;
    }
    if (city.toLowerCase() === 'mumbai') {
      for (const rest of MUMBAI_RESTAURANTS) {
        targets.push({ city, name: rest.name, description: rest.description });
      }
      continue;
    }
    if (city.toLowerCase() === 'kolkata') {
      for (const rest of KOLKATA_RESTAURANTS) {
        targets.push({ city, name: rest.name, description: rest.description });
      }
      continue;
    }
    if (city.toLowerCase() === 'delhi') {
      for (const rest of DELHI_RESTAURANTS) {
        targets.push({ city, name: rest.name, description: rest.description });
      }
      continue;
    }

    for (const brand of DEFAULT_RESTAURANT_BRANDS) {
      targets.push({
        city,
        name: getRestaurantName(city, brand.name),
        description: brand.description
      });
    }
  }

  return targets;
}

function toSlug(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function hashString(value = '') {
  let hash = 0;
  const text = String(value);
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getRestaurantImageByName(name = '') {
  const lower = String(name).toLowerCase();

  if (lower.includes('sri krishna punjabi dhaba')) {
    return 'https://tse3.mm.bing.net/th/id/OIP.LZBJUmyJGToPujxsFqge0wHaEo?pid=Api&P=0&h=180';
  }
  if (lower.includes('chittimutyalu')) {
    return 'https://tse1.mm.bing.net/th/id/OIP.qbdycgW-icueYFS7X1A0-wHaLH?pid=Api&P=0&h=180';
  }
  if (lower.includes('lassi shop')) {
    return 'https://loremflickr.com/1200/800/lassi,drink,beverage?lock=9103';
  }
  if (lower.includes('subbaiah gari hotel')) {
    return 'https://loremflickr.com/1200/800/tiffin,south-indian,breakfast?lock=9104';
  }
  if (lower.includes('rajahmundry kritunga')) {
    return 'https://source.unsplash.com/1200x800/?andhra,restaurant,interior&sig=5101';
  }
  if (lower.includes('rajahmundry kfc')) {
    return 'https://source.unsplash.com/1200x800/?fast-food,restaurant,interior&sig=5102';
  }
  if (lower.includes('rajahmundry subway')) {
    return 'https://source.unsplash.com/1200x800/?sandwich,restaurant,interior&sig=5103';
  }
  if (lower.includes('rajahmundry the red box')) {
    return 'https://source.unsplash.com/1200x800/?chinese,restaurant,interior&sig=5104';
  }
  if (lower.includes('rajahmundry fresh choice - patisserie, bakery & cafe')) {
    return 'https://source.unsplash.com/1200x800/?bakery,cafe,restaurant,interior&sig=5105';
  }
  if (lower.includes('hyderabad domino')) {
    return 'https://source.unsplash.com/1200x800/?pizza,restaurant,interior&sig=5151';
  }
  if (lower.includes('hyderabad paradise biryani')) {
    return 'https://source.unsplash.com/1200x800/?hyderabad,biryani,restaurant,interior&sig=5152';
  }
  if (lower.includes('hyderabad bawarchi')) {
    return 'https://source.unsplash.com/1200x800/?indian,restaurant,interior,biryani&sig=5153';
  }
  if (lower.includes('hyderabad shah ghouse')) {
    return 'https://source.unsplash.com/1200x800/?mughlai,restaurant,interior,hyderabad&sig=5154';
  }
  if (lower.includes('hyderabad chutneys')) {
    return 'https://source.unsplash.com/1200x800/?south-indian,restaurant,interior&sig=5155';
  }
  if (lower.includes('mumbai leopold cafe')) {
    return 'https://source.unsplash.com/1200x800/?cafe,restaurant,interior,mumbai&sig=5161';
  }
  if (lower.includes('mumbai bademiya')) {
    return 'https://source.unsplash.com/1200x800/?kebab,restaurant,interior,mumbai&sig=5162';
  }
  if (lower.includes('mumbai trishna')) {
    return 'https://source.unsplash.com/1200x800/?seafood,restaurant,interior,mumbai&sig=5163';
  }
  if (lower.includes('mumbai cafe madras')) {
    return 'https://source.unsplash.com/1200x800/?south-indian,restaurant,interior,mumbai&sig=5164';
  }
  if (lower.includes('mumbai the bombay canteen')) {
    return 'https://source.unsplash.com/1200x800/?modern-indian,restaurant,interior,mumbai&sig=5165';
  }
  if (lower.includes('kolkata arsalan')) {
    return 'https://source.unsplash.com/1200x800/?biryani,restaurant,interior,kolkata&sig=5171';
  }
  if (lower.includes('kolkata peter cat')) {
    return 'https://source.unsplash.com/1200x800/?restaurant,interior,kolkata&sig=5172';
  }
  if (lower.includes('kolkata flurys')) {
    return 'https://source.unsplash.com/1200x800/?bakery,cafe,interior,kolkata&sig=5173';
  }
  if (lower.includes('kolkata 6 ballygunge place')) {
    return 'https://source.unsplash.com/1200x800/?bengali,restaurant,interior,kolkata&sig=5174';
  }
  if (lower.includes('kolkata bhojohori manna')) {
    return 'https://source.unsplash.com/1200x800/?indian,restaurant,interior,kolkata&sig=5175';
  }
  if (lower.includes('delhi mcdonald')) {
    return 'https://source.unsplash.com/1200x800/?mcdonalds,restaurant,interior&sig=5201';
  }
  if (lower.includes('delhi karim')) {
    return 'https://source.unsplash.com/1200x800/?mughlai,restaurant,interior,old-delhi&sig=5202';
  }
  if (lower.includes('delhi bikanervala')) {
    return 'https://source.unsplash.com/1200x800/?indian,sweets,restaurant,interior&sig=5203';
  }
  if (lower.includes('delhi haldiram')) {
    return 'https://source.unsplash.com/1200x800/?indian,veg,restaurant,interior&sig=5204';
  }
  if (lower.includes('delhi sagar ratna')) {
    return 'https://source.unsplash.com/1200x800/?south-indian,restaurant,interior&sig=5205';
  }

  const lock = 5000 + (hashString(name) % 100000);
  return `https://loremflickr.com/1200/800/restaurant,interior,food?lock=${lock}`;
}

function getDishImageByCategory(category = '') {
  const map = {
    Biryani: '/uploads/seed-dish-biryani.jpg',
    Meals: '/uploads/seed-dish-meals.jpg',
    Snacks: '/uploads/seed-dish-snacks.jpg',
    'Fast Food': '/uploads/seed-dish-fastfood.jpg',
    Beverages: '/uploads/seed-dish-beverages.jpg',
    Desserts: '/uploads/seed-dish-desserts.jpg',
    Other: '/uploads/seed-dish-snacks.jpg'
  };
  return map[category] || '/uploads/seed-dish-snacks.jpg';
}

function getRestaurantImage(city, restaurantName) {
  return getRestaurantImageByName(`${city} ${restaurantName}`);
}

async function fetchBingDishImage(dishName, querySuffix = 'indian food dish') {
  const key = `${String(dishName || '').trim().toLowerCase()}::${String(querySuffix || '').trim().toLowerCase()}`;
  if (DISH_IMAGE_CACHE.has(key)) return DISH_IMAGE_CACHE.get(key);

  const fallback = getDishImageByCategory('Other');
  if (!key) return fallback;

  try {
    const query = encodeURIComponent(`${dishName} ${querySuffix}`);
    const url = `https://www.bing.com/images/search?q=${query}&qft=+filterui:imagesize-large&form=HDRSC2&first=1`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'text/html'
      }
    });
    if (!res.ok) {
      DISH_IMAGE_CACHE.set(key, fallback);
      return fallback;
    }
    const html = await res.text();
    // Extract stable base image ID and avoid tiny thumbnail query params like ?w=156.
    const match = html.match(/https:\/\/tse\d\.mm\.bing\.net\/th\/id\/OIP\.[A-Za-z0-9_-]+/i);
    const image = match ? `${match[0]}?pid=Api&rs=1&c=1` : fallback;
    DISH_IMAGE_CACHE.set(key, image);
    return image;
  } catch {
    DISH_IMAGE_CACHE.set(key, fallback);
    return fallback;
  }
}

async function getDishImageByName(restaurantName, dishName) {
  const lowerRestaurant = String(restaurantName).toLowerCase();
  const lowerName = String(dishName).toLowerCase();
  if (lowerName.includes('chicken dum biryani') || lowerName === 'chicken biryani') {
    return 'https://tse2.mm.bing.net/th/id/OIP.WUFVvVjBPbcFYFnwWyLFdgHaFj?pid=Api&P=0&h=180';
  }
  if (
    lowerName.includes('chicken tikka biryani') &&
    (lowerRestaurant.includes('punjabi dhaba') || lowerRestaurant.includes('chittimutyalu'))
  ) {
    return 'https://www.cookwithkushi.com/wp-content/uploads/2016/04/chicken_tikka_biryani_recipe_best_simple_easy.jpg';
  }
  const fetched = await fetchBingDishImage(dishName, 'indian dish food photo');
  if (String(fetched).startsWith('/uploads/seed-dish-')) {
    return getDishNameBasedOnlineImage(dishName, 'indian-food');
  }
  return fetched;
}

function getAdjustedPrice(restaurantName, dishName, basePrice) {
  const lower = String(restaurantName).toLowerCase();
  const restaurantOffset = lower.includes('punjabi dhaba') ? 18 : lower.includes('chittimutyalu') ? -8 : 0;
  const dishOffset = (hashString(`${restaurantName}-${dishName}`) % 41) - 20; // -20..+20
  return Math.max(79, basePrice + restaurantOffset + dishOffset);
}

function getUniqueDishImageUrl(imageUrl, uniqueKey) {
  if (!imageUrl) return imageUrl;
  const key = encodeURIComponent(toSlug(uniqueKey || 'dish-image'));

  if (/^https?:\/\//i.test(imageUrl)) {
    try {
      const parsed = new URL(imageUrl);
      parsed.searchParams.set('imgkey', key);
      return parsed.toString();
    } catch {
      // If URL parsing fails, safely append query on raw string.
    }
  }

  return imageUrl.includes('?') ? `${imageUrl}&imgkey=${key}` : `${imageUrl}?imgkey=${key}`;
}

async function getPreservedDishImage(restaurantId, dishName, proposedImageUrl, uniqueKey) {
  const existingDish = await Dish.findOne({ restaurant: restaurantId, name: dishName }).select('image');
  const existingImage = typeof existingDish?.image === 'string' ? existingDish.image.trim() : '';
  if (existingImage) return existingImage;
  return getUniqueDishImageUrl(proposedImageUrl, uniqueKey);
}

function getDishNameBasedOnlineImage(dishName, extraTag = 'food') {
  const slug = toSlug(dishName);
  const tags = slug ? `${slug.replace(/-/g, ',')},${extraTag}` : extraTag;
  const lock = 300000 + (hashString(`${dishName}-${extraTag}`) % 100000);
  return `https://loremflickr.com/1200/800/${tags}?lock=${lock}`;
}

function getDishNameBasedUnsplashImage(dishName, extraTag = 'south-indian-food') {
  const slug = toSlug(dishName);
  const query = slug ? `${slug.replace(/-/g, ',')},${extraTag}` : extraTag;
  const sig = 1000 + (hashString(`${dishName}-${extraTag}`) % 100000);
  return `https://source.unsplash.com/1200x800/?${query}&sig=${sig}`;
}

function getSubbaiahDishImageByName(dishName) {
  const exactMap = {
    'idli (2 pcs)': 'https://source.unsplash.com/1200x800/?idli,sambar,south-indian-food&sig=4101',
    'ghee idli': 'https://source.unsplash.com/1200x800/?ghee,idli,south-indian-food&sig=4102',
    'rava idli': 'https://source.unsplash.com/1200x800/?rava,idli,south-indian-food&sig=4103',
    'medu vada (2 pcs)': 'https://source.unsplash.com/1200x800/?medu-vada,sambar,south-indian-food&sig=4104',
    'sambar vada': 'https://source.unsplash.com/1200x800/?sambar-vada,south-indian-food&sig=4105',
    'plain dosa': 'https://source.unsplash.com/1200x800/?plain,dosa,south-indian-food&sig=4106',
    'masala dosa': 'https://source.unsplash.com/1200x800/?masala,dosa,south-indian-food&sig=4107',
    'ghee karam dosa': 'https://source.unsplash.com/1200x800/?ghee,karam,dosa,south-indian-food&sig=4108',
    'onion dosa': 'https://source.unsplash.com/1200x800/?onion,dosa,south-indian-food&sig=4109',
    'pesarattu': 'https://source.unsplash.com/1200x800/?pesarattu,south-indian-food&sig=4110',
    'upma pesarattu': 'https://source.unsplash.com/1200x800/?upma,pesarattu,south-indian-food&sig=4111',
    'rava dosa': 'https://source.unsplash.com/1200x800/?rava,dosa,south-indian-food&sig=4112',
    'pongal': 'https://source.unsplash.com/1200x800/?ven-pongal,south-indian-food&sig=4113',
    'poori with aloo curry': 'https://source.unsplash.com/1200x800/?poori,aloo-curry,south-indian-food&sig=4114',
    'uttapam': 'https://source.unsplash.com/1200x800/?uttapam,south-indian-food&sig=4115',
    'vegetable upma': 'https://source.unsplash.com/1200x800/?vegetable,upma,south-indian-food&sig=4116',
    'tomato bath': 'https://source.unsplash.com/1200x800/?tomato,bath,rice,south-indian-food&sig=4117',
    'curd rice': 'https://source.unsplash.com/1200x800/?curd-rice,south-indian-food&sig=4118',
    'lemon rice': 'https://source.unsplash.com/1200x800/?lemon-rice,south-indian-food&sig=4119',
    'vegetable meals': 'https://source.unsplash.com/1200x800/?south-indian,veg-thali,food&sig=4121',
    'sambar rice': 'https://tse2.mm.bing.net/th/id/OIP.zqQK2RV8VA5gD5Pt6Cw7uQHaLL?pid=Api&P=0&h=180',
    'rasam rice': 'https://source.unsplash.com/1200x800/?rasam-rice,south-indian-food&sig=4123',
    'vegetable biryani': 'https://source.unsplash.com/1200x800/?vegetable,biryani,food&sig=4124',
    'paneer biryani': 'https://source.unsplash.com/1200x800/?paneer,biryani,food&sig=4125',
    'veg fried rice': 'https://source.unsplash.com/1200x800/?veg,fried-rice,food&sig=4126',
    'veg noodles': 'https://source.unsplash.com/1200x800/?veg,noodles,food&sig=4127',
    'gobi manchurian': 'https://source.unsplash.com/1200x800/?gobi,manchurian,food&sig=4128',
    'paneer butter masala': 'https://source.unsplash.com/1200x800/?paneer,butter-masala,food&sig=4129',
    'mixed veg curry': 'https://source.unsplash.com/1200x800/?mixed-veg,curry,food&sig=4130'
  };
  const key = String(dishName || '').toLowerCase();
  if (exactMap[key]) return exactMap[key];

  // Fallback to dish-name query if a new dish is added later.
  const slug = toSlug(dishName);
  const query = slug ? `${slug.replace(/-/g, ',')},south-indian,food` : 'south-indian,food';
  const sig = 4300 + (hashString(`subbaiah-${dishName}`) % 100000);
  return `https://source.unsplash.com/1200x800/?${query}&sig=${sig}`;
}

function getFreshChoiceDessertImageByName(dishName) {
  const exactMap = {
    'chocolate cake': 'https://butternutbakeryblog.com/wp-content/uploads/2023/04/chocolate-cake.jpg',
    'black forest cake': 'https://loremflickr.com/1200/800/black-forest,cake,dessert,food?lock=9302',
    'red velvet cake': 'https://tse3.mm.bing.net/th/id/OIP.2a96G3RV2H39KW3LQBH0wgHaHa?pid=Api&P=0&h=180',
    'butterscotch cake': 'https://loremflickr.com/1200/800/butterscotch,cake,dessert,food?lock=9304',
    'vanilla pastry': 'https://tse1.mm.bing.net/th/id/OIP.qgaV_RW_zUXYr9F6k3gRVwHaEK?pid=Api&P=0&h=180',
    'chocolate pastry': 'https://tse2.mm.bing.net/th/id/OIP.pZloPABQ4_Ua0fwRnDaizQHaEK?pid=Api&P=0&h=180',
    'strawberry ice cream': 'https://loremflickr.com/1200/800/strawberry,ice-cream,dessert,food?lock=9307',
    'vanilla ice cream': 'https://loremflickr.com/1200/800/vanilla,ice-cream,dessert,food?lock=9308',
    'chocolate ice cream': 'https://loremflickr.com/1200/800/chocolate,ice-cream,dessert,food?lock=9309',
    'butterscotch ice cream': 'https://loremflickr.com/1200/800/butterscotch,ice-cream,dessert,food?lock=9310',
    'mango ice cream': 'https://loremflickr.com/1200/800/mango,ice-cream,dessert,food?lock=9311',
    'fruit salad with ice cream': 'https://loremflickr.com/1200/800/fruit-salad,ice-cream,dessert,food?lock=9312',
    'brownie with ice cream': 'https://loremflickr.com/1200/800/brownie,ice-cream,dessert,food?lock=9313',
    'gulab jamun with ice cream': 'https://vismaifood.com/storage/app/uploads/public/558/130/b9b/thumb__1200_0_0_0_auto.jpg',
    'kulfi falooda': 'https://www.herbsjoy.com/wp-content/uploads/2024/11/Rose-Falooda-Featured-Image-500x375-1.webp'
  };
  const key = String(dishName || '').toLowerCase();
  if (exactMap[key]) return exactMap[key];

  const slug = toSlug(dishName);
  // Use strict dessert-name query so image intent matches the exact item name.
  const tags = slug ? `${slug.replace(/-/g, ',')},dessert` : 'dessert';
  const lock = 810000 + (hashString(`fresh-choice-${dishName}`) % 100000);
  return `https://loremflickr.com/1200/800/${tags}?lock=${lock}`;
}

function getRajahmundryDishImageByName(dishName) {
  const slug = toSlug(dishName);
  const tags = slug ? `${slug.replace(/-/g, ',')},food` : 'food';
  const lock = 990000 + (hashString(`rajahmundry-${dishName}`) % 100000);
  return `https://loremflickr.com/1200/800/${tags}?lock=${lock}`;
}

function getKfcDishImageByName(dishName) {
  const slug = toSlug(dishName);
  const tags = slug ? `${slug.replace(/-/g, ',')},fried-chicken,fast-food` : 'fried-chicken,fast-food';
  const lock = 995000 + (hashString(`kfc-${dishName}`) % 100000);
  return `https://loremflickr.com/1200/800/${tags}?lock=${lock}`;
}

function getSubwayDishImageByName(dishName) {
  const exactMap = {
    'dark chunk chocolate cookie': 'https://tse3.mm.bing.net/th/id/OIP.9Uyjz4uuxqQkf8QOOSTVEQHaHa?pid=Api&P=0&h=180',
    'great american bbq meal': 'https://img.freepik.com/premium-photo/american-barbecue-feast-scene-featuring-variety-classic-barbecue-dishes-presented-outdoor_278455-29869.jpg'
  };
  const key = String(dishName || '').toLowerCase();
  if (exactMap[key]) return exactMap[key];

  const slug = toSlug(dishName);
  const tags = slug ? `${slug.replace(/-/g, ',')},subway,sandwich,food` : 'subway,sandwich,food';
  const lock = 996000 + (hashString(`subway-${dishName}`) % 100000);
  return `https://loremflickr.com/1200/800/${tags}?lock=${lock}`;
}

function getRedBoxDishImageByName(dishName) {
  const exactMap = {
    'apollo fish': 'https://source.unsplash.com/1200x800/?fried-fish,indo-chinese,food&sig=6201'
  };
  const key = String(dishName || '').toLowerCase();
  if (exactMap[key]) return exactMap[key];

  const slug = toSlug(dishName);
  const tags = slug ? `${slug.replace(/-/g, ',')},indo-chinese,food` : 'indo-chinese,food';
  const lock = 997000 + (hashString(`red-box-${dishName}`) % 100000);
  return `https://loremflickr.com/1200/800/${tags}?lock=${lock}`;
}

function getFreshChoiceRajahmundryDishImageByName(dishName) {
  const key = String(dishName || '').toLowerCase();
  if (FRESH_CHOICE_IMAGE_OVERRIDES[key]) return FRESH_CHOICE_IMAGE_OVERRIDES[key];

  const slug = toSlug(dishName);
  const tags = slug ? `${slug.replace(/-/g, ',')},cake,pastry,bakery,food` : 'cake,pastry,bakery,food';
  const lock = 998000 + (hashString(`fresh-choice-rjy-${dishName}`) % 100000);
  return `https://loremflickr.com/1200/800/${tags}?lock=${lock}`;
}

function getDelhiDishTemplatesForRestaurant(restaurantName) {
  const lower = String(restaurantName || '').toLowerCase();
  if (lower.includes('mcdonald')) return DELHI_MCDONALDS_DISH_TEMPLATES;
  if (lower.includes('karim')) return DELHI_KARIMS_DISH_TEMPLATES;
  if (lower.includes('bikanervala')) return DELHI_BIKANERVALA_DISH_TEMPLATES;
  if (lower.includes('haldiram')) return DELHI_HALDIRAMS_DISH_TEMPLATES;
  if (lower.includes('sagar ratna')) return DELHI_SAGAR_RATNA_DISH_TEMPLATES;
  return [];
}

function getDelhiDishImageByName(restaurantName, dishName) {
  const lowerRestaurant = String(restaurantName || '').toLowerCase();
  const lowerDish = String(dishName || '').toLowerCase();
  if (lowerRestaurant.includes('sagar ratna')) {
    const exactMap = {
      'lemon rice': 'https://source.unsplash.com/1200x800/?lemon-rice,south-indian-food&sig=8301',
      'curd rice': 'https://source.unsplash.com/1200x800/?curd-rice,south-indian-food&sig=8302',
      'filter coffee': 'https://source.unsplash.com/1200x800/?south-indian-filter-coffee&sig=8303'
    };
    if (exactMap[lowerDish]) return exactMap[lowerDish];
  }

  const restaurantSlug = toSlug(restaurantName);
  const dishSlug = toSlug(dishName);
  const tags = [
    dishSlug ? dishSlug.replace(/-/g, ',') : 'food',
    restaurantSlug ? restaurantSlug.replace(/-/g, ',') : 'restaurant',
    'food'
  ].join(',');
  const lock = 999000 + (hashString(`delhi-${restaurantName}-${dishName}`) % 100000);
  return `https://loremflickr.com/1200/800/${tags}?lock=${lock}`;
}

async function ensureDelhiDishesForRestaurant(restaurant) {
  const dishTemplates = getDelhiDishTemplatesForRestaurant(restaurant.name);
  if (dishTemplates.length === 0) return { created: 0, updated: 0, totalTarget: 0 };

  const validDishNames = dishTemplates.map((d) => d.name);
  await Dish.deleteMany({
    restaurant: restaurant._id,
    name: { $nin: validDishNames }
  });

  let created = 0;
  let updated = 0;

  for (const dish of dishTemplates) {
    let imageUrl = getDelhiDishImageByName(restaurant.name, dish.name);
    const fetched = await fetchBingDishImage(`${restaurant.name} ${dish.name}`, 'food dish photo');
    if (!String(fetched).startsWith('/uploads/seed-dish-')) {
      imageUrl = fetched;
    }
    const dishImage = await getPreservedDishImage(
      restaurant._id,
      dish.name,
      imageUrl,
      `${restaurant.name}-${dish.name}`
    );

    const result = await Dish.updateOne(
      { restaurant: restaurant._id, name: dish.name },
      {
        $set: {
          category: dish.category,
          price: dish.price,
          image: dishImage,
          available: true
        },
        $setOnInsert: {
          restaurant: restaurant._id,
          name: dish.name
        }
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      created += 1;
    } else if (result.modifiedCount > 0) {
      updated += 1;
    }
  }

  return {
    created,
    updated,
    totalTarget: dishTemplates.length
  };
}

function getHyderabadDishTemplatesForRestaurant(restaurantName) {
  const lower = String(restaurantName || '').toLowerCase();
  if (lower.includes('domino')) return HYDERABAD_DOMINOS_DISH_TEMPLATES;
  if (lower.includes('paradise biryani')) return HYDERABAD_PARADISE_DISH_TEMPLATES;
  if (lower.includes('bawarchi')) return HYDERABAD_BAWARCHI_DISH_TEMPLATES;
  if (lower.includes('shah ghouse')) return HYDERABAD_SHAH_GHOUSE_DISH_TEMPLATES;
  if (lower.includes('chutneys')) return HYDERABAD_CHUTNEYS_DISH_TEMPLATES;
  return [];
}

const GUARANTEED_FOOD_IMAGES = {
  biryani: 'https://commons.wikimedia.org/wiki/Special:FilePath/Chicken_Biryani_2.jpg',
  dosa: 'https://commons.wikimedia.org/wiki/Special:FilePath/Dosa_Classic.jpg',
  curry: 'https://commons.wikimedia.org/wiki/Special:FilePath/Curry_-_Indian_cuisine.jpg',
  kebab: 'https://commons.wikimedia.org/wiki/Special:FilePath/Seekh_Kebabs.jpg',
  shawarma: 'https://commons.wikimedia.org/wiki/Special:FilePath/Chicken_shawarma.jpg',
  pizza: 'https://commons.wikimedia.org/wiki/Special:FilePath/Veg_Pizza.jpg',
  burger: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hamburger_%28black_bg%29.jpg',
  friedRice: 'https://commons.wikimedia.org/wiki/Special:FilePath/Fried_rice_%28rice_mixed_with_desired_ingredients.jpg',
  beverage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lassi.jpg',
  dessert: 'https://commons.wikimedia.org/wiki/Special:FilePath/Khawa_Gulab_Jamun.jpg',
  default: 'https://commons.wikimedia.org/wiki/Special:FilePath/Indiandishes.jpg'
};

function getGuaranteedFoodImageByDishName(dishName, category = '') {
  const name = String(dishName || '').toLowerCase();
  const cat = String(category || '').toLowerCase();

  if (name.includes('biryani')) return GUARANTEED_FOOD_IMAGES.biryani;
  if (
    name.includes('dosa')
    || name.includes('idli')
    || name.includes('vada')
    || name.includes('uttapam')
    || name.includes('pesarattu')
    || name.includes('upma')
  ) {
    return GUARANTEED_FOOD_IMAGES.dosa;
  }
  if (name.includes('shawarma')) return GUARANTEED_FOOD_IMAGES.shawarma;
  if (
    name.includes('kebab')
    || name.includes('kabab')
    || name.includes('roll')
    || name.includes('65')
    || name.includes('tikka')
    || name.includes('lollipop')
    || cat === 'snacks'
  ) {
    return GUARANTEED_FOOD_IMAGES.kebab;
  }
  if (name.includes('pizza') || name.includes('garlic bread')) return GUARANTEED_FOOD_IMAGES.pizza;
  if (name.includes('burger')) return GUARANTEED_FOOD_IMAGES.burger;
  if (name.includes('fried rice') || name.includes('noodles')) return GUARANTEED_FOOD_IMAGES.friedRice;
  if (
    cat === 'beverages'
    || name.includes('juice')
    || name.includes('lassi')
    || name.includes('mojito')
    || name.includes('fizz')
    || name.includes('milkshake')
    || name.includes('tea')
    || name.includes('coffee')
  ) {
    return GUARANTEED_FOOD_IMAGES.beverage;
  }
  if (
    cat === 'desserts'
    || name.includes('dessert')
    || name.includes('cake')
    || name.includes('ice cream')
    || name.includes('jamun')
  ) {
    return GUARANTEED_FOOD_IMAGES.dessert;
  }
  if (cat === 'meals' || name.includes('curry') || name.includes('thali') || name.includes('soup')) {
    return GUARANTEED_FOOD_IMAGES.curry;
  }

  return GUARANTEED_FOOD_IMAGES.default;
}

function getHyderabadDishImageByName(restaurantName, dishName, category) {
  return getGuaranteedFoodImageByDishName(dishName, category);
}

async function ensureHyderabadDishesForRestaurant(restaurant) {
  const dishTemplates = getHyderabadDishTemplatesForRestaurant(restaurant.name);
  if (dishTemplates.length === 0) return { created: 0, updated: 0, totalTarget: 0 };

  const validDishNames = dishTemplates.map((d) => d.name);
  await Dish.deleteMany({
    restaurant: restaurant._id,
    name: { $nin: validDishNames }
  });

  let created = 0;
  let updated = 0;

  for (const dish of dishTemplates) {
    const imageUrl = getHyderabadDishImageByName(restaurant.name, dish.name, dish.category);
    const dishImage = await getPreservedDishImage(
      restaurant._id,
      dish.name,
      imageUrl,
      `${restaurant.name}-${dish.name}`
    );

    const result = await Dish.updateOne(
      { restaurant: restaurant._id, name: dish.name },
      {
        $set: {
          category: dish.category,
          price: dish.price,
          image: dishImage,
          available: true
        },
        $setOnInsert: {
          restaurant: restaurant._id,
          name: dish.name
        }
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      created += 1;
    } else if (result.modifiedCount > 0) {
      updated += 1;
    }
  }

  return {
    created,
    updated,
    totalTarget: dishTemplates.length
  };
}

function getMumbaiDishTemplatesForRestaurant(restaurantName) {
  const lower = String(restaurantName || '').toLowerCase();
  if (lower.includes('leopold cafe')) return MUMBAI_LEOPOLD_DISH_TEMPLATES;
  if (lower.includes('bademiya')) return MUMBAI_BADEMIYA_DISH_TEMPLATES;
  if (lower.includes('trishna')) return MUMBAI_TRISHNA_DISH_TEMPLATES;
  if (lower.includes('cafe madras')) return MUMBAI_CAFE_MADRAS_DISH_TEMPLATES;
  if (lower.includes('the bombay canteen')) return MUMBAI_BOMBAY_CANTEEN_DISH_TEMPLATES;
  return [];
}

function getMumbaiDishImageByName(restaurantName, dishName, category) {
  return getGuaranteedFoodImageByDishName(dishName, category);
}

async function ensureMumbaiDishesForRestaurant(restaurant) {
  const dishTemplates = getMumbaiDishTemplatesForRestaurant(restaurant.name);
  if (dishTemplates.length === 0) return { created: 0, updated: 0, totalTarget: 0 };

  const validDishNames = dishTemplates.map((d) => d.name);
  await Dish.deleteMany({
    restaurant: restaurant._id,
    name: { $nin: validDishNames }
  });

  let created = 0;
  let updated = 0;

  for (const dish of dishTemplates) {
    const imageUrl = getMumbaiDishImageByName(restaurant.name, dish.name, dish.category);
    const dishImage = await getPreservedDishImage(
      restaurant._id,
      dish.name,
      imageUrl,
      `${restaurant.name}-${dish.name}`
    );

    const result = await Dish.updateOne(
      { restaurant: restaurant._id, name: dish.name },
      {
        $set: {
          category: dish.category,
          price: dish.price,
          image: dishImage,
          available: true
        },
        $setOnInsert: {
          restaurant: restaurant._id,
          name: dish.name
        }
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      created += 1;
    } else if (result.modifiedCount > 0) {
      updated += 1;
    }
  }

  return {
    created,
    updated,
    totalTarget: dishTemplates.length
  };
}

function getKolkataDishTemplatesForRestaurant(restaurantName) {
  const lower = String(restaurantName || '').toLowerCase();
  if (lower.includes('arsalan')) return KOLKATA_ARSALAN_DISH_TEMPLATES;
  if (lower.includes('peter cat')) return KOLKATA_PETER_CAT_DISH_TEMPLATES;
  if (lower.includes('flurys')) return KOLKATA_FLURYS_DISH_TEMPLATES;
  if (lower.includes('6 ballygunge place')) return KOLKATA_BALLYGUNGE_DISH_TEMPLATES;
  if (lower.includes('bhojohori manna')) return KOLKATA_BHOJOHORI_DISH_TEMPLATES;
  return [];
}

function getKolkataDishImageByName(restaurantName, dishName, category) {
  return getGuaranteedFoodImageByDishName(dishName, category);
}

async function ensureKolkataDishesForRestaurant(restaurant) {
  const dishTemplates = getKolkataDishTemplatesForRestaurant(restaurant.name);
  if (dishTemplates.length === 0) return { created: 0, updated: 0, totalTarget: 0 };

  const validDishNames = dishTemplates.map((d) => d.name);
  await Dish.deleteMany({
    restaurant: restaurant._id,
    name: { $nin: validDishNames }
  });

  let created = 0;
  let updated = 0;

  for (const dish of dishTemplates) {
    const imageUrl = getKolkataDishImageByName(restaurant.name, dish.name, dish.category);
    const dishImage = await getPreservedDishImage(
      restaurant._id,
      dish.name,
      imageUrl,
      `${restaurant.name}-${dish.name}`
    );

    const result = await Dish.updateOne(
      { restaurant: restaurant._id, name: dish.name },
      {
        $set: {
          category: dish.category,
          price: dish.price,
          image: dishImage,
          available: true
        },
        $setOnInsert: {
          restaurant: restaurant._id,
          name: dish.name
        }
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      created += 1;
    } else if (result.modifiedCount > 0) {
      updated += 1;
    }
  }

  return {
    created,
    updated,
    totalTarget: dishTemplates.length
  };
}

async function ensureRestaurant(city, restaurantName, description, ownerId, imageUrl) {
  let restaurant = await Restaurant.findOne({
    name: restaurantName,
    city,
    owner: ownerId
  });

  if (!restaurant) {
    restaurant = await Restaurant.create({
      name: restaurantName,
      city,
      description,
      image: imageUrl || '',
      owner: ownerId,
      allowCancellation: true
    });
  } else {
    restaurant.description = description;
    // Preserve existing restaurant image; only backfill if missing.
    if (!restaurant.image && imageUrl) {
      restaurant.image = imageUrl;
    }
    restaurant.allowCancellation = true;
    await restaurant.save();
  }

  return restaurant;
}

async function ensureNonVegDishesForRestaurant(restaurant) {
  const validDishNames = NONVEG_DISH_TEMPLATES.map((d) => d.name);
  const deleteResult = await Dish.deleteMany({
    restaurant: restaurant._id,
    name: { $nin: validDishNames }
  });

  let created = 0;
  let updated = 0;

  for (const dish of NONVEG_DISH_TEMPLATES) {
    const adjustedPrice = getAdjustedPrice(restaurant.name, dish.name, dish.price);
    const existingDish = await Dish.findOne({ restaurant: restaurant._id, name: dish.name }).select('image');
    const dishImage = await getDishImageByName(restaurant.name, dish.name);
    const uniqueDishImage = existingDish?.image || getUniqueDishImageUrl(dishImage, `${restaurant.name}-${dish.name}`);
    const result = await Dish.updateOne(
      { restaurant: restaurant._id, name: dish.name },
      {
        $set: {
          category: dish.category,
          price: adjustedPrice,
          image: uniqueDishImage,
          available: true
        },
        $setOnInsert: {
          restaurant: restaurant._id,
          name: dish.name
        }
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      created += 1;
    } else if (result.modifiedCount > 0) {
      updated += 1;
    }
  }

  return {
    created,
    updated,
    removed: deleteResult.deletedCount || 0,
    totalTarget: NONVEG_DISH_TEMPLATES.length
  };
}

async function ensureLassiShopDishesForRestaurant(restaurant) {
  const validDishNames = LASSI_SHOP_DISH_TEMPLATES.map((d) => d.name);
  await Dish.deleteMany({
    restaurant: restaurant._id,
    name: { $nin: validDishNames }
  });

  let created = 0;
  let updated = 0;
  const fixedImageOverrides = {
    'coca cola 300ml': 'https://wallpapers.com/images/hd/coca-cola-5oo8i79x5mxrb9tc.jpg',
    'oreo milkshake': 'https://thesaltymarshmallow.com/wp-content/uploads/2018/08/oreo-milkshakes1.jpg'
  };

  for (const dish of LASSI_SHOP_DISH_TEMPLATES) {
    const lowerDishName = String(dish.name).toLowerCase();
    const existingDish = await Dish.findOne({ restaurant: restaurant._id, name: dish.name }).select('image');
    let dishImageByName = fixedImageOverrides[lowerDishName]
      || await fetchBingDishImage(dish.name, 'soft drink juice mocktail milkshake product photo');
    if (String(dishImageByName).startsWith('/uploads/seed-dish-')) {
      dishImageByName = getDishNameBasedOnlineImage(dish.name, 'drink,beverage');
    }
    const uniqueDishImage = existingDish?.image || getUniqueDishImageUrl(dishImageByName, `${restaurant.name}-${dish.name}`);

    const result = await Dish.updateOne(
      { restaurant: restaurant._id, name: dish.name },
      {
        $set: {
          category: dish.category,
          price: dish.price,
          image: uniqueDishImage,
          available: true
        },
        $setOnInsert: {
          restaurant: restaurant._id,
          name: dish.name
        }
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      created += 1;
    } else if (result.modifiedCount > 0) {
      updated += 1;
    }
  }

  return {
    created,
    updated,
    totalTarget: LASSI_SHOP_DISH_TEMPLATES.length
  };
}

async function ensureVegTiffinDishesForRestaurant(restaurant) {
  const validDishNames = SUBBAIAH_VEG_DISH_TEMPLATES.map((d) => d.name);
  await Dish.deleteMany({
    restaurant: restaurant._id,
    name: { $nin: validDishNames }
  });

  let created = 0;
  let updated = 0;
  const fixedVegImageOverrides = {
    'idli (2 pcs)': 'https://tse1.mm.bing.net/th/id/OIP.GJvMclPK8AolsRQAJeJAfAHaHa?pid=Api&P=0&h=180',
    'ghee idli': 'https://tse2.mm.bing.net/th/id/OIP.BArZLmS6ibP0EH7UgvSSpQAAAA?pid=Api&P=0&h=180',
    'sambar rice': 'https://tse2.mm.bing.net/th/id/OIP.zqQK2RV8VA5gD5Pt6Cw7uQHaLL?pid=Api&P=0&h=180'
  };

  for (const dish of SUBBAIAH_VEG_DISH_TEMPLATES) {
    const lowerDishName = String(dish.name).toLowerCase();
    // Prefer live online image URL by exact dish name for better food-image matching.
    let dishImageByName = fixedVegImageOverrides[lowerDishName]
      || await fetchBingDishImage(dish.name, 'south indian food dish photo');
    if (String(dishImageByName).startsWith('/uploads/seed-dish-')) {
      dishImageByName = getSubbaiahDishImageByName(dish.name);
    }

    const uniqueDishImage = await getPreservedDishImage(
      restaurant._id,
      dish.name,
      dishImageByName || dish.image,
      `${restaurant.name}-${dish.name}`
    );
    const result = await Dish.updateOne(
      { restaurant: restaurant._id, name: dish.name },
      {
        $set: {
          category: dish.category,
          price: dish.price,
          image: uniqueDishImage,
          available: true
        },
        $setOnInsert: {
          restaurant: restaurant._id,
          name: dish.name
        }
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      created += 1;
    } else if (result.modifiedCount > 0) {
      updated += 1;
    }
  }

  return {
    created,
    updated,
    totalTarget: SUBBAIAH_VEG_DISH_TEMPLATES.length
  };
}

async function ensureSubbaiahDishesForAllKakinadaRestaurants() {
  const subbaiahRestaurants = await Restaurant.find({
    city: { $regex: /^kakinada$/i },
    name: { $regex: /^subbaiah gari hotel$/i }
  }).select('_id name city');

  let created = 0;
  let updated = 0;

  for (const restaurant of subbaiahRestaurants) {
    const result = await ensureVegTiffinDishesForRestaurant(restaurant);
    created += result.created;
    updated += result.updated;
  }

  return {
    restaurantsMatched: subbaiahRestaurants.length,
    created,
    updated
  };
}

async function ensureFreshChoiceDessertsForRestaurant(restaurant, options = {}) {
  const { pruneOtherDishes = true } = options;
  const validDishNames = FRESH_CHOICE_DESSERT_TEMPLATES.map((d) => d.name);
  if (pruneOtherDishes) {
    await Dish.deleteMany({
      restaurant: restaurant._id,
      name: { $nin: validDishNames }
    });
  }

  let created = 0;
  let updated = 0;

  for (const dish of FRESH_CHOICE_DESSERT_TEMPLATES) {
    const dessertImage = getFreshChoiceDessertImageByName(dish.name);
    const uniqueDishImage = await getPreservedDishImage(
      restaurant._id,
      dish.name,
      dessertImage,
      `${restaurant.name}-${dish.name}`
    );

    const result = await Dish.updateOne(
      { restaurant: restaurant._id, name: dish.name },
      {
        $set: {
          category: dish.category,
          price: dish.price,
          image: uniqueDishImage,
          available: true
        },
        $setOnInsert: {
          restaurant: restaurant._id,
          name: dish.name
        }
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      created += 1;
    } else if (result.modifiedCount > 0) {
      updated += 1;
    }
  }

  return {
    created,
    updated,
    totalTarget: FRESH_CHOICE_DESSERT_TEMPLATES.length
  };
}

async function ensureFreshChoiceDessertsForAllKakinadaRestaurants() {
  const freshChoiceRestaurants = await Restaurant.find({
    city: { $regex: /^kakinada$/i },
    name: { $regex: /^fresh choice$/i }
  }).select('_id name city');

  let created = 0;
  let updated = 0;
  for (const restaurant of freshChoiceRestaurants) {
    const result = await ensureFreshChoiceDessertsForRestaurant(restaurant, { pruneOtherDishes: false });
    created += result.created;
    updated += result.updated;
  }

  return {
    restaurantsMatched: freshChoiceRestaurants.length,
    created,
    updated
  };
}

async function ensureRajahmundryDishesForRestaurant(restaurant) {
  const lowerName = String(restaurant.name).toLowerCase();
  const isKfc = lowerName.includes('kfc');
  const isSubway = lowerName.includes('subway');
  const isRedBox = lowerName.includes('the red box');
  const isFreshChoiceRajahmundry = lowerName.includes('fresh choice');
  const dishTemplates = isKfc
    ? KFC_DISH_TEMPLATES
    : isSubway
      ? SUBWAY_DISH_TEMPLATES
      : isRedBox
        ? RED_BOX_DISH_TEMPLATES
        : isFreshChoiceRajahmundry
          ? FRESH_CHOICE_RAJAHMUNDRY_DISH_TEMPLATES
          : RAJAHMUNDRY_DISH_TEMPLATES;
  const imageResolver = isKfc
    ? getKfcDishImageByName
    : isSubway
      ? getSubwayDishImageByName
      : isRedBox
        ? getRedBoxDishImageByName
        : isFreshChoiceRajahmundry
          ? getFreshChoiceRajahmundryDishImageByName
          : getRajahmundryDishImageByName;
  const validDishNames = dishTemplates.map((d) => d.name);
  await Dish.deleteMany({
    restaurant: restaurant._id,
    name: { $nin: validDishNames }
  });

  let created = 0;
  let updated = 0;

  for (const dish of dishTemplates) {
    let imageUrl = imageResolver(dish.name);
    if (isKfc) {
      const fetched = await fetchBingDishImage(`KFC ${dish.name}`, 'food product photo');
      if (!String(fetched).startsWith('/uploads/seed-dish-')) {
        imageUrl = fetched;
      }
    } else if (isSubway) {
      const fetched = await fetchBingDishImage(`Subway ${dish.name}`, 'sub sandwich wrap salad cookie food photo');
      if (!String(fetched).startsWith('/uploads/seed-dish-')) {
        imageUrl = fetched;
      }
    } else if (isRedBox) {
      const fetched = await fetchBingDishImage(`The Red Box ${dish.name}`, 'indo chinese food photo');
      if (!String(fetched).startsWith('/uploads/seed-dish-')) {
        imageUrl = fetched;
      }
    } else if (isFreshChoiceRajahmundry) {
      const fetched = await fetchBingDishImage(`Fresh Choice Rajahmundry ${dish.name}`, 'cake pastry dessert food photo');
      if (!String(fetched).startsWith('/uploads/seed-dish-')) {
        imageUrl = fetched;
      }
    }
    const dishImage = await getPreservedDishImage(
      restaurant._id,
      dish.name,
      imageUrl,
      `${restaurant.name}-${dish.name}`
    );

    const result = await Dish.updateOne(
      { restaurant: restaurant._id, name: dish.name },
      {
        $set: {
          category: dish.category,
          price: dish.price,
          image: dishImage,
          available: true
        },
        $setOnInsert: {
          restaurant: restaurant._id,
          name: dish.name
        }
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      created += 1;
    } else if (result.modifiedCount > 0) {
      updated += 1;
    }
  }

  return {
    created,
    updated,
    totalTarget: dishTemplates.length
  };
}

async function removeRestaurantsWithoutImages() {
  // Avoid destructive cleanup so existing restaurants/images are preserved.
  return { restaurantsRemoved: 0, dishesRemoved: 0 };
}

async function normalizeExternalImageUrls() {
  // Do not rewrite existing restaurant image URLs during seed.
  return {
    restaurantsNormalized: 0,
    dishesNormalized: 0
  };
}

async function backfillRemainingDishImages() {
  const subbaiahRestaurants = await Restaurant.find({
    name: { $regex: /subbaiah gari hotel/i }
  }).select('_id');
  const subbaiahIds = subbaiahRestaurants.map((r) => r._id);
  if (subbaiahIds.length === 0) return { dishesBackfilled: 0 };

  const dishesToFix = await Dish.find({
    restaurant: { $in: subbaiahIds },
    $or: [
      { image: { $exists: false } },
      { image: null },
      { image: '' },
      { image: { $regex: /^\/uploads\/seed-dish-/i } }
    ]
  }).select('_id name image restaurant');

  let updated = 0;

  for (const dish of dishesToFix) {
    const resolvedImage = getDishNameBasedOnlineImage(dish.name, 'food');

    dish.image = getUniqueDishImageUrl(resolvedImage, `${dish.restaurant}-${dish.name}`);
    await dish.save();
    updated += 1;
  }

  return { dishesBackfilled: updated };
}

async function removeObsoleteSeedRestaurants(ownerId, targetRestaurants) {
  const validKeys = new Set(
    targetRestaurants.map((r) => `${r.city.toLowerCase()}::${r.name.toLowerCase()}`)
  );

  const ownerRestaurants = await Restaurant.find({ owner: ownerId }).select('_id city name');
  const obsoleteIds = ownerRestaurants
    .filter((r) => !validKeys.has(`${String(r.city).toLowerCase()}::${String(r.name).toLowerCase()}`))
    .map((r) => r._id);

  if (obsoleteIds.length === 0) return { obsoleteRemoved: 0 };

  await Dish.deleteMany({ restaurant: { $in: obsoleteIds } });
  const deleteResult = await Restaurant.deleteMany({ _id: { $in: obsoleteIds } });
  return { obsoleteRemoved: deleteResult.deletedCount || 0 };
}

async function seedDefaultCatalog() {
  const normalizeResult = await normalizeExternalImageUrls();
  const cleanupResult = await removeRestaurantsWithoutImages();
  const owner = await ensureSeedOwner();
  const targetRestaurants = getTargetRestaurants();
  const obsoleteCleanup = await removeObsoleteSeedRestaurants(owner._id, targetRestaurants);

  let restaurantsCreated = 0;
  let dishesCreated = 0;
  let dishesUpdated = 0;
  let dishesRemovedFromSpecialRestaurants = 0;
  let lassiDishesCreated = 0;
  let lassiDishesUpdated = 0;
  let vegTiffinDishesCreated = 0;
  let vegTiffinDishesUpdated = 0;
  let freshChoiceDessertsCreated = 0;
  let freshChoiceDessertsUpdated = 0;
  let rajahmundryDishesCreated = 0;
  let rajahmundryDishesUpdated = 0;
  let hyderabadDishesCreated = 0;
  let hyderabadDishesUpdated = 0;
  let mumbaiDishesCreated = 0;
  let mumbaiDishesUpdated = 0;
  let kolkataDishesCreated = 0;
  let kolkataDishesUpdated = 0;
  let delhiDishesCreated = 0;
  let delhiDishesUpdated = 0;

  for (const target of targetRestaurants) {
    const restaurantExisted = await Restaurant.exists({
      name: target.name,
      city: target.city,
      owner: owner._id
    });

    const imageUrl = getRestaurantImage(target.city, target.name);
    const restaurant = await ensureRestaurant(target.city, target.name, target.description, owner._id, imageUrl);
    if (!restaurantExisted) restaurantsCreated += 1;

    if (target.city.toLowerCase() === 'kakinada' && SPECIAL_NONVEG_RESTAURANTS.has(target.name.toLowerCase())) {
      const dishResult = await ensureNonVegDishesForRestaurant(restaurant);
      dishesCreated += dishResult.created;
      dishesUpdated += dishResult.updated;
      dishesRemovedFromSpecialRestaurants += dishResult.removed;
    } else if (target.city.toLowerCase() === 'kakinada' && SPECIAL_LASSI_RESTAURANTS.has(target.name.toLowerCase())) {
      const lassiDishResult = await ensureLassiShopDishesForRestaurant(restaurant);
      lassiDishesCreated += lassiDishResult.created;
      lassiDishesUpdated += lassiDishResult.updated;
    } else if (target.city.toLowerCase() === 'kakinada' && SPECIAL_VEG_TIFFIN_RESTAURANTS.has(target.name.toLowerCase())) {
      const vegDishResult = await ensureVegTiffinDishesForRestaurant(restaurant);
      vegTiffinDishesCreated += vegDishResult.created;
      vegTiffinDishesUpdated += vegDishResult.updated;
    } else if (target.city.toLowerCase() === 'kakinada' && SPECIAL_DESSERT_RESTAURANTS.has(target.name.toLowerCase())) {
      const dessertResult = await ensureFreshChoiceDessertsForRestaurant(restaurant);
      freshChoiceDessertsCreated += dessertResult.created;
      freshChoiceDessertsUpdated += dessertResult.updated;
    } else if (target.city.toLowerCase() === 'rajahmundry' && SPECIAL_RAJAHMUNDRY_RESTAURANTS.has(target.name.toLowerCase())) {
      const rajahmundryDishResult = await ensureRajahmundryDishesForRestaurant(restaurant);
      rajahmundryDishesCreated += rajahmundryDishResult.created;
      rajahmundryDishesUpdated += rajahmundryDishResult.updated;
    } else if (target.city.toLowerCase() === 'hyderabad' && SPECIAL_HYDERABAD_RESTAURANTS.has(target.name.toLowerCase())) {
      const hyderabadDishResult = await ensureHyderabadDishesForRestaurant(restaurant);
      hyderabadDishesCreated += hyderabadDishResult.created;
      hyderabadDishesUpdated += hyderabadDishResult.updated;
    } else if (target.city.toLowerCase() === 'mumbai' && SPECIAL_MUMBAI_RESTAURANTS.has(target.name.toLowerCase())) {
      const mumbaiDishResult = await ensureMumbaiDishesForRestaurant(restaurant);
      mumbaiDishesCreated += mumbaiDishResult.created;
      mumbaiDishesUpdated += mumbaiDishResult.updated;
    } else if (target.city.toLowerCase() === 'kolkata' && SPECIAL_KOLKATA_RESTAURANTS.has(target.name.toLowerCase())) {
      const kolkataDishResult = await ensureKolkataDishesForRestaurant(restaurant);
      kolkataDishesCreated += kolkataDishResult.created;
      kolkataDishesUpdated += kolkataDishResult.updated;
    } else if (target.city.toLowerCase() === 'delhi' && SPECIAL_DELHI_RESTAURANTS.has(target.name.toLowerCase())) {
      const delhiDishResult = await ensureDelhiDishesForRestaurant(restaurant);
      delhiDishesCreated += delhiDishResult.created;
      delhiDishesUpdated += delhiDishResult.updated;
    }
  }

  const backfillResult = await backfillRemainingDishImages();
  const freshChoiceSyncResult = await ensureFreshChoiceDessertsForAllKakinadaRestaurants();
  const subbaiahSyncResult = await ensureSubbaiahDishesForAllKakinadaRestaurants();

  return {
    cities: TARGET_CITIES.length,
    restaurantsTarget: targetRestaurants.length,
    dishesPerSpecialRestaurant: NONVEG_DISH_TEMPLATES.length,
    normalizedRestaurantImages: normalizeResult.restaurantsNormalized,
    normalizedDishImages: normalizeResult.dishesNormalized,
    restaurantsRemovedWithoutImages: cleanupResult.restaurantsRemoved,
    dishesRemovedWithRestaurants: cleanupResult.dishesRemoved,
    obsoleteSeedRestaurantsRemoved: obsoleteCleanup.obsoleteRemoved,
    restaurantsCreated,
    dishesCreated,
    dishesUpdated,
    dishesRemovedFromSpecialRestaurants,
    lassiDishesTarget: LASSI_SHOP_DISH_TEMPLATES.length,
    lassiDishesCreated,
    lassiDishesUpdated,
    vegTiffinDishesTarget: SUBBAIAH_VEG_DISH_TEMPLATES.length,
    vegTiffinDishesCreated,
    vegTiffinDishesUpdated,
    freshChoiceDessertsTarget: FRESH_CHOICE_DESSERT_TEMPLATES.length,
    freshChoiceDessertsCreated,
    freshChoiceDessertsUpdated,
    rajahmundryDishesTarget: RAJAHMUNDRY_DISH_TEMPLATES.length,
    rajahmundryDishesCreated,
    rajahmundryDishesUpdated,
    hyderabadRestaurantsTarget: HYDERABAD_RESTAURANTS.length,
    hyderabadDishesPerRestaurantTarget: HYDERABAD_DOMINOS_DISH_TEMPLATES.length,
    hyderabadDishesCreated,
    hyderabadDishesUpdated,
    mumbaiRestaurantsTarget: MUMBAI_RESTAURANTS.length,
    mumbaiDishesPerRestaurantTarget: MUMBAI_LEOPOLD_DISH_TEMPLATES.length,
    mumbaiDishesCreated,
    mumbaiDishesUpdated,
    kolkataRestaurantsTarget: KOLKATA_RESTAURANTS.length,
    kolkataDishesPerRestaurantTarget: KOLKATA_ARSALAN_DISH_TEMPLATES.length,
    kolkataDishesCreated,
    kolkataDishesUpdated,
    delhiRestaurantsTarget: DELHI_RESTAURANTS.length,
    delhiDishesPerRestaurantTarget: DELHI_MCDONALDS_DISH_TEMPLATES.length,
    delhiDishesCreated,
    delhiDishesUpdated,
    freshChoiceRestaurantsMatched: freshChoiceSyncResult.restaurantsMatched,
    freshChoiceDessertsCreatedAcrossAll: freshChoiceSyncResult.created,
    freshChoiceDessertsUpdatedAcrossAll: freshChoiceSyncResult.updated,
    subbaiahRestaurantsMatched: subbaiahSyncResult.restaurantsMatched,
    subbaiahDishesCreatedAcrossAll: subbaiahSyncResult.created,
    subbaiahDishesUpdatedAcrossAll: subbaiahSyncResult.updated,
    dishesBackfilledWithOnlineImages: backfillResult.dishesBackfilled
  };
}

module.exports = seedDefaultCatalog;
