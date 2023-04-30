// add dotenv
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const User = require("./Models/User");

const app = express();
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);

// connect to mongoDB
mongoose.connect(process.env.MONGO_URL);

const jwtSecret = process.env.JWT_SECRET;

// first endpoint
app.get("/test", (req, res) => {
  res.json("Test good");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  // create a new user
  try {
    const createdUser = await new User({
      username: username,
      password: password,
    });
    jwt.sign(
      { userId: createdUser._id, username },
      jwtSecret,
      {},
      (err, token) => {
        if (err) throw err;
        res
          .cookie("token", token, { sameSite: "none", secure: true })
          .status(201)
          .json("ok good");
      }
    );
  } catch (err) {
    if (err) throw err;
    res.status(500).json("error");
  }
});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});
