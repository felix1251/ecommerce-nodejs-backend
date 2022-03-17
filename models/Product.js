const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true, max: 5 },
    comment: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    desc: { type: String, required: true },
    img: { type: Array, required: true },
    categories: { type: Array },
    size: { type: Array },
    color: { type: Array },
    reviews: [reviewSchema],
    price: { type: Number, required: true },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
