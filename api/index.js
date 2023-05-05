// add dotenv
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const User = require("./Models/User");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);

// connect to mongoDB
mongoose.connect("mongodb://127.0.0.1:27017/testUser");

const jwtSecret = process.env.JWT_SECRET;

const bcryptSalt = bcrypt.genSaltSync(10);

// first endpoint
app.get("/test", (req, res) => {
  res.json("Test good");
});

// profile endpoint
app.get("/profile", async (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json("You need to Login");
  try {
    const verified = jwt.verify(token, jwtSecret);
    res.json(verified);
  } catch (err) {
    res.status(401).json("You need to Login");
  }
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);
  // create a new user
  try {
    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
    const createdUser = await new User({
      username: username,
      password: hashedPassword,
    });
    await createdUser.save();
    jwt.sign(
      { userId: createdUser._id, username },
      jwtSecret,
      {},
      (err, token) => {
        if (err) throw err;
        res
          .cookie("token", token, {
            sameSite: "none",
            secure: true,
          })
          .status(201)
          .json({ id: createdUser._id });
      }
    );
  } catch (err) {
    if (err) throw err;
    res.status(500).json("error");
  }
});

// login endpoint
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // check if user exists
  try {
    const userFound = await User.findOne({ username: username });
    if (!userFound) return res.status(401).json("Wrong username or password");
    // check if password is correct
    const passwordMatch = bcrypt.compareSync(password, userFound.password);
    if (!passwordMatch)
      return res.status(401).json("Wrong username or password");
    // create a token
    jwt.sign(
      { userId: userFound._id, username },
      jwtSecret,
      {},
      (err, token) => {
        if (err) throw err;
        res
          .cookie("token", token, {
            sameSite: "none",
            secure: true,
          })
          .status(200)
          .json({ id: userFound._id });
      }
    );
  } catch (err) {
    if (err) throw err;
    res.status(500).json("error");
  }
});

app.listen(3030, () => {
  console.log("Server started on port 3030");
});
