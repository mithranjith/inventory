const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const CONFIG = require("../config/config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { to, TE, isNull } = require("../services/util.services");

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      default: "",
    },
    lastName: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: CONFIG.user_roles,
      default: "user",
    },
    permissions: [
      {
        type: String,
        enum: CONFIG.user_permissions,
        default: [],
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
  { strict: false }
);

UserSchema.methods.getJWT = function () {
  let expiration_time = parseInt(CONFIG.jwt_expiration);
  return (
    "Bearer " +
    jwt.sign({ user_id: this._id }, CONFIG.jwt_encryption, {
      expiresIn: expiration_time,
    })
  );
};

UserSchema.plugin(mongoosePaginate);

UserSchema.pre("save", async function (next) {
  if (!isNull(this.password)) {
    if (this.isModified("password") || this.isNew) {
      let err, salt, hash;
      [err, salt] = await to(bcrypt.genSalt(10));
      if (err) TE(err.message, true);

      [err, hash] = await to(bcrypt.hash(this.password, salt));
      if (err) TE(err.message, true);
      this.password = hash;
    } else {
      return next();
    }
  } else {
    return next();
  }
});

UserSchema.methods.comparePassword = async function (pw) {
  let err, pass;

  if (!this.password) TE("password not set");
  [err, pass] = await to(bcrypt.compare(pw, this.password));
  if (err) TE(err);

  if (!pass) return null;

  return this;
};

let Users = (module.exports = mongoose.model("users", UserSchema));
