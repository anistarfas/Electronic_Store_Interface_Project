const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var order = new Schema({}, { strict: false });

//schema used for the order which will hold the relvent data
let orderSchema = Schema({
  user: {
    type: String,
    required: true,
  },
  restaurantID: {
    type: String,
    required: true,
  },
  restaurantName: {
    type: String,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },

  fee: {
    type: Number,
    required: true,
  },

  tax: {
    type: Number,
    required: true,
  },

  order: {
    type: order,
  },
});

module.exports = mongoose.model("Order", orderSchema);
