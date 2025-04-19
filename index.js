const express = require("express");
const mongoose = require("mongoose");
const shortid = require("shortid");
const Url = require("models\Url.js");

const app = express();
const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

app.use(express.json());

mongoose.connect("mongodb://localhost:27017/urlshortener", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

// POST /api/shorten
app.post("/api/shorten", async (req, res) => {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ error: "Original URL is required" });
  }

  const shortId = shortid.generate();

  const newUrl = new Url({ originalUrl, shortId });
  await newUrl.save();

  res.status(201).json({
    originalUrl,
    shortUrl: `${BASE_URL}/${shortId}`
  });
});

// GET /:shortId → redirect
app.get("/:shortId", async (req, res) => {
  const { shortId } = req.params;
  const url = await Url.findOne({ shortId });

  if (!url) {
    return res.status(404).json({ error: "Short URL not found" });
  }

  url.clicks++;
  await url.save();

  res.redirect(url.originalUrl);
});

// GET /api/:shortId → get info
app.get("/api/:shortId", async (req, res) => {
  const { shortId } = req.params;
  const url = await Url.findOne({ shortId });

  if (!url) {
    return res.status(404).json({ error: "Short URL not found" });
  }

  res.json({
    originalUrl: url.originalUrl,
    shortUrl: `${BASE_URL}/${url.shortId}`,
    clicks: url.clicks
  });
});

app.listen(PORT, () => {
  console.log(`Server running at ${BASE_URL}`);
});
