const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    messageText: {
      type: String,
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const MessageModel = mongoose.model("Message", messageSchema);
module.exports = MessageModel;
