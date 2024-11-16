const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  token: String,
  email: String,
  password: String,
  status: { type: String, default: "valid" },
  createdAt: { type: Date, default: Date.now },
});

const searchParamSchema = new mongoose.Schema({
  name: String,
  params: mongoose.Schema.Types.Mixed,
  currentPage: Number,
  completedPages: {
    type: [Number], // Array of Numbers
    default: [], // Default to an empty array
  },
  totalCount: Number,
  savedCount: Number,
  fullyScraped: Boolean,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Token = mongoose.model("Token", tokenSchema);
const SearchParam = mongoose.model("SearchParam", searchParamSchema);

module.exports = { Token, SearchParam };
