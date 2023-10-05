const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const CategoriesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    image: {
      type: String,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "categories",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
  { strict: false }
);

CategoriesSchema.plugin(mongoosePaginate);
CategoriesSchema.plugin(aggregatePaginate);

let Categories = (module.exports = mongoose.model(
  "categories",
  CategoriesSchema
));
