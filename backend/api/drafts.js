const express = require("express");
const serverless = require("serverless-http");
const Draft = require("../models/Draft");
require("dotenv").config();

const app = express();
app.use(express.json());

// ✅ Save Draft
app.post("/api/drafts", async (req, res) => {
  try {
    const { userId, title, content } = req.body;
    const draft = new Draft({ userId, title, content });
    await draft.save();
    res.status(201).json(draft);
  } catch (err) {
    res.status(500).json({ message: "Error saving draft", error: err });
  }
});

// ✅ Get Latest Draft
app.get("/api/drafts/latest", async (req, res) => {
  try {
    const latestDraft = await Draft.findOne().sort({ createdAt: -1 });
    res.json(latestDraft);
  } catch (err) {
    res.status(500).json({ message: "Error fetching latest draft", error: err });
  }
});

// ✅ Update Draft
app.put("/api/drafts/:id", async (req, res) => {
  try {
    const updatedDraft = await Draft.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedDraft);
  } catch (err) {
    res.status(500).json({ message: "Error updating draft", error: err });
  }
});

// ✅ Export for Serverless
module.exports = serverless(app);
