const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const CONFIG = require("../config/config");

const ProductsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    name: {
      type: String,
      default: "",
      required: true,
    },
    unit: {
      type: String,
      enum: CONFIG.units,
      default: "Qty",
      required: true,
    },
    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "categories",
        required: true,
      },
    ],
    images: [{ type: String, required: true }],
    price: {
      type: Number,
      required: true,
    },
    discount_percentage: {
      type: Number,
      required: true,
    },
    discount_amount: {
      type: Number,
      required: true,
    },
    discount_range: {
      from: {
        type: Date,
        required: true,
      },
      to: {
        type: Date,
        required: true,
      },
    },
    tax_percentage: {
      type: Number,
      required: true,
    },
    tax_amount: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      min: 0,
      default: 0,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  { timestamps: true },
  { strict: false }
);

ProductsSchema.plugin(mongoosePaginate);
ProductsSchema.plugin(aggregatePaginate);

let Products = (module.exports = mongoose.model("products", ProductsSchema));
