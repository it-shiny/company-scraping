const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Token, SearchParam } = require("./models/token.js"); // Assume proper schema definitions
const { getValidToken } = require("./controllers/searchController.js");
const {
  getTotalCount,
  fetchAndSaveContacts,
} = require("./controllers/contactController.js");

const app = express();
app.use(cors());
app.use(express.json()); // bodyParser.json() is deprecated

const mongoDBURI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/reachStream";
const port = process.env.PORT || 5000;

mongoose
  .connect(mongoDBURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

// Routes can be moved to separate route files for better organization
app.post("/registerToken", async (req, res) => {
  try {
    const { token } = req.body;
    const newToken = await new Token({ token }).save();
    res.status(201).json({ message: "Token registered", token: newToken });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error registering token", error: err.message });
  }
});

app.post("/setSearchParams", async (req, res) => {
  try {
    const { name, params } = req.body;
    const token = await getValidToken();
    const totalCountData = await getTotalCount(token, params);
    params["totalCount"] = totalCountData.counts;
    params["page"] = params["page"] ? params["page"] : 1;
    const currentPage = params["page"] ? params["page"] : 1;
    params["pageSize"] = params["pageSize"] ? params["pageSize"] : 10;
    const newSearchParam = await new SearchParam({
      name,
      params,
      currentPage,
    }).save();
    res.status(201).json(newSearchParam);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error setting search parameters", error: err.message });
  }
});

app.delete("/delete-search-param/:id", async (req, res) => {
  try {
    await SearchParam.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Parameter deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting parameter", error: error.message });
  }
});

app.post("/startScraping", async (req, res) => {
  // Placeholder for actual scraping logic
  const { paramId } = req.body;
  const tokenData = await getValidToken();
  const searchParams = await SearchParam.findOne({ _id: paramId })
    .sort({ createdAt: -1 })
    .lean();
  fetchAndSaveContacts(tokenData.token, searchParams);
  res.status(200).json({ message: "Scraping started", startedAt: new Date() });
});

app.get("/getCurrentTokens", async (req, res) => {
  try {
    const tokens = await Token.find().sort({ createdAt: -1 });
    res.status(200).json(tokens.map((t) => t.token));
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching tokens", error: err.message });
  }
});

app.get("/getCurrentSearchParams", async (req, res) => {
  try {
    const paramId = req.query.paramId;
    const searchParams = await SearchParam.findOne({ _id: paramId }).sort({
      createdAt: -1,
    });
    res.status(200).json(searchParams ? searchParams : {});
  } catch (err) {
    res.status(500).json({
      message: "Error fetching search parameters",
      error: err.message,
    });
  }
});

app.get("/search-params", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;

    const [searchParams, totalItems] = await Promise.all([
      SearchParam.find()
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      SearchParam.countDocuments(),
    ]);

    res.status(200).json({
      items: searchParams,
      totalPages: Math.ceil(totalItems / pageSize),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching search parameters",
      error: err.message,
    });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
