const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: Number,
  imageUrl: String,
  userId: String
});

const CartItem = mongoose.model('CartItem', cartSchema);

module.exports = CartItem;
