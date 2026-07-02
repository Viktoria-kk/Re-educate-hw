const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    birthDate: {
      type: Date,
      required: true,
    },

    blogs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "blog",
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("user", userSchema);
