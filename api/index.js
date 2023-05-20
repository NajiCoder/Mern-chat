// add dotenv
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const User = require("./Models/User");
const Message = require("./Models/Message");
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

async function getDataFromRequest(req) {
  const token = req.cookies?.token;
  if (!token) throw new Error("No token found");
  try {
    const verified = jwt.verify(token, jwtSecret);
    const { userId, username } = verified;
    return { userId, username };
  } catch (err) {
    throw new Error("You need to login");
  }
}

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

// Get messages for a specific user from the database
app.get("/messages/:userId", async (req, res) => {
  const { userId } = req.params; // get the userId from the client axios request
  const userDate = await getDataFromRequest(req);
  const currentUserId = userDate.userId;
  // check for meessages in the database
  const messages = await Message.find({
    sender: { $in: [userId, currentUserId] },
    receiver: { $in: [userId, currentUserId] },
  }).sort({ createdAt: -1 });

  res.json(messages);
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
  // read the username and userId from the cookie for this connection
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

  connection.on("message", async (message) => {
    // parse the message
    const messageData = JSON.parse(message.toString());
    const { recipient, text } = messageData;
    console.log(messageData);
    if (recipient && text) {
      // save the message to the database
      const newMessage = new Message({
        messageText: text,
        sender: connection.userId,
        receiver: recipient,
      });
      await newMessage.save();
      [...webSocketServer.clients]
        .filter((client) => client.userId === recipient)
        .forEach((client) =>
          client.send(
            JSON.stringify({
              text,
              sender: connection.userId,
              receiver: recipient,
              messageId: newMessage._id,
            })
          )
        );
    }
  });

  // notify all clients about all online users
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
