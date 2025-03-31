const express = require("express");
const passport = require("passport");
require("./passport");
const { google } = require("googleapis");
const cors = require("cors");
const session = require("express-session");
const mongoose = require("mongoose");
const Draft = require("./models/Draft");
require("dotenv").config();

console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 1, // 1 hour session expiration
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) return; // Already connected
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
  }
};
connectDB();

app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Google OAuth Routes
app.get(
  "/auth/google",
  (req, res, next) => {
    console.log("Google Auth Request Received"); // Debugging log
    next();
  },
  passport.authenticate("google", {
    scope: ["profile", "email"], // ✅ Ensure scope is present
    prompt: "consent", // ✅ Ensure re-authentication
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);

    process.nextTick(async () => {
      try {
        if (req.user) {
          req.user.lastLogin = new Date();
          await req.user.save();
        }
      } catch (err) {
        console.error("Error saving user:", err);
      }
    });
  }
);

app.get("/auth/user", (req, res) => {
  req.isAuthenticated()
    ? res.json({ user: req.user })
    : res.json({ user: null });
});

// Logout Route
app.post("/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });

    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to clear session" });
      }

      res.clearCookie("connect.sid", { path: "/" });

      res.status(200).json({ message: "Logged out successfully" });
    });
  });
});

app.get("/auth/google/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.redirect(
        "https://accounts.google.com/logout?continue=https://www.google.com/"
      );
    });
  });
});

// Draft Model & API Routes
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

app.get("/api/drafts/latest", async (req, res) => {
  try {
    const latestDraft = await Draft.findOne().sort({ createdAt: -1 });
    res.json(latestDraft);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching latest draft", error: err });
  }
});

app.put("/api/drafts/:id", async (req, res) => {
  try {
    const updatedDraft = await Draft.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedDraft);
  } catch (err) {
    res.status(500).json({ message: "Error updating draft", error: err });
  }
});

// Google Drive Integration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const drive = google.drive({ version: "v3", auth: oauth2Client });

// Function to Get or Create "Letters" Folder
async function getOrCreateLettersFolder() {
  try {
    const folderResponse = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder' and name='Letters'",
      fields: "files(id, name)",
    });

    if (folderResponse.data.files.length > 0) {
      return folderResponse.data.files[0].id;
    }

    const folderMetadata = {
      name: "Letters",
      mimeType: "application/vnd.google-apps.folder",
    };

    const folder = await drive.files.create({
      resource: folderMetadata,
      fields: "id",
    });

    return folder.data.id;
  } catch (error) {
    console.error("Error getting/creating 'Letters' folder:", error);
    throw error;
  }
}

// Upload Draft to Google Drive
app.post("/api/upload-draft-to-drive", async (req, res) => {
  try {
    const { draftId } = req.body;
    const draft = await Draft.findById(draftId);
    if (!draft) return res.status(404).json({ message: "Draft not found" });

    const folderId = await getOrCreateLettersFolder();

    const fileMetadata = {
      name: draft.title,
      mimeType: "application/vnd.google-apps.document",
      parents: [folderId],
    };

    const media = { mimeType: "text/plain", body: draft.content };

    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
    });

    res.json({
      message: "Draft uploaded to Google Drive successfully!",
      fileId: file.data.id,
    });
  } catch (error) {
    console.error("Error uploading draft:", error);
    res.status(500).json({ error: "Failed to upload draft" });
  }
});

// List Saved Letters
app.get("/api/drive/files", async (req, res) => {
  try {
    const folderId = await getOrCreateLettersFolder();

    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.document'`,
      fields: "files(id, name, createdTime)",
      orderBy: "createdTime desc",
    });

    res.status(200).json(response.data.files);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Failed to retrieve files" });
  }
});

// View Letter Content
app.get("/api/drive/file/:fileId", async (req, res) => {
  try {
    const response = await drive.files.export(
      { fileId: req.params.fileId, mimeType: "text/plain" },
      { responseType: "stream" }
    );

    res.setHeader("Content-Type", "text/plain");
    response.data.pipe(res);
  } catch (error) {
    console.error(
      "Error fetching file content:",
      error.response?.data || error
    );
    res.status(500).json({ error: "Failed to retrieve file content" });
  }
});

// Download Letter as PDF
app.get("/api/drive/file/:fileId/pdf", async (req, res) => {
  try {
    const fileId = req.params.fileId;

    const fileMetadata = await drive.files.get({
      fileId: fileId,
      fields: "name",
    });

    const fileName = fileMetadata.data.name || "letter";

    const response = await drive.files.export(
      { fileId: fileId, mimeType: "application/pdf" },
      { responseType: "stream" }
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}.pdf"`
    );
    res.setHeader("Content-Type", "application/pdf");

    response.data.pipe(res);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ error: "Failed to download file" });
  }
});

// Start Server
app.listen(process.env.PORT || 5000, () =>
  console.log(
    `Server running on ${process.env.SERVER_URL || "http://localhost:5000"}`
  )
);
