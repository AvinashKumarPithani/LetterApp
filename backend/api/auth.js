const express = require("express");
const serverless = require("serverless-http");
const passport = require("passport");
const session = require("express-session");
const jwt = require("jsonwebtoken");
require("./passport"); // Load passport configuration

const app = express();
app.use(express.json());

// Enable session management for Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ✅ Google OAuth Route
app.get(
  "/api/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/api/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // Generate JWT Token after login
    const token = jwt.sign({ user: req.user }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
  }
);

// ✅ Get Authenticated User
app.get("/api/auth/user", (req, res) => {
  req.isAuthenticated()
    ? res.json({ user: req.user })
    : res.json({ user: null });
});

// ✅ Logout Route
app.post("/api/auth/logout", (req, res) => {
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

// ✅ Export for Serverless
module.exports = serverless(app);
