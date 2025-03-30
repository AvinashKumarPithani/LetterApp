// backend/routes/drafts.js
const express = require("express");
const router = express.Router();
const Draft = require("../models/Draft");

// Save a draft
router.post("/", async (req, res) => {
  try {
    const { userId, title, content } = req.body;
    const draft = new Draft({ userId, title, content });
    await draft.save();
    res.status(201).json(draft);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retrieve a draft
router.get("/:id", async (req, res) => {
  try {
    const draft = await Draft.findById(req.params.id);
    if (!draft) return res.status(404).json({ message: "Draft not found" });
    res.json(draft);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a draft
router.put("/:id", async (req, res) => {
  try {
    const { title, content } = req.body;
    const draft = await Draft.findByIdAndUpdate(
      req.params.id,
      { title, content, updatedAt: Date.now() },
      { new: true }
    );
    if (!draft) return res.status(404).json({ message: "Draft not found" });
    res.json(draft);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a draft
router.delete("/:id", async (req, res) => {
  try {
    const draft = await Draft.findByIdAndDelete(req.params.id);
    if (!draft) return res.status(404).json({ message: "Draft not found" });
    res.json({ message: "Draft deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// backend/server.js (Include drafts route)
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const draftsRouter = require("./routes/drafts");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use("/api/drafts", draftsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
