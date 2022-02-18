const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    mobileNo: { type: Number, required: true },
    products: [
      {
        productId: { type: String },
        quantity: { type: Number, default: 1 },
        color: { type: String },
        img: { type: String },
      },
    ],
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    paymentType: { type: String, default: "CASH ON DELIVERY" },
    status: { type: String, default: "pending" },
    reciever: { type: String, default: "admin" } 
  },
  { timestamps: true }
);
module.exports = mongoose.model("Order", OrderSchema);
