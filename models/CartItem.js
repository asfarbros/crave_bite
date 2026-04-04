const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: Number,
  userId: String
});

const CartItem = mongoose.model('CartItem', cartSchema);

module.exports = CartItem;
