// add dotenv
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const User = require("./Models/User");
const ws = require("ws");

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

const server = app.listen(3030, () => {
  console.log("Server started on port 3030");
});

// Websocket
const webSocketServer = new ws.Server({ server }); // create a new websocket server
webSocketServer.on("connection", (connection, req) => {
  const cookies = req.headers.cookie;
  if (cookies) {
    // get the token from the cookie array
    const tokenCookieString = cookies
      .split(";")
      .find((str) => str.startsWith("token="));
    if (tokenCookieString) {
      const token = tokenCookieString.split("=")[1];
      try {
        jwt.verify(token, jwtSecret, {}, (err, userDate) => {
          if (err) throw err;
          const { userId, username } = userDate;
          connection.userId = userId;
          connection.username = username;
        });
      } catch (err) {
        console.log(err);
      }
    }
  }

  [...webSocketServer.clients].forEach((client) => {
    // send the online users to the client
    client.send(
      JSON.stringify({
        online: [...webSocketServer.clients].map((client) => ({
          userId: client.userId,
          username: client.username,
        })),
      })
    );
  });
});
