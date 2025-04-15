const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  photo: { type: String, default: "" },
  role: { type: String, enum: ["customer", "admin"], default: "customer" },
  cart: { type: mongoose.Schema.Types.Mixed, default: {} },
  wishlist: { type: mongoose.Schema.Types.Mixed, default: {} },
  date: { type: Date, default: Date.now },
});

// Generate JWT Token
UserSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { _id: this._id, role: this.role },
    process.env.JWTPRIVATEKEY,
    { expiresIn: "7d" }
  );
};

// User Model
const User = mongoose.model("User", UserSchema);

// Validation Function
const validate = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: passwordComplexity().required(),
    photo: Joi.string().allow(""), // Optional field
    role: Joi.string().valid("customer", "admin").default("customer"),
  });

  return schema.validate(data);
};

module.exports = { User, validate };
