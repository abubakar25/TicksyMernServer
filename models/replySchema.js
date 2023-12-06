const mongoose = require("mongoose");
const ReplySchema = new mongoose.Schema(
  {
    // media: { type: String },
    reply: { type: String },
    custId: { type: String },
    customerId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    agentId: { type: String },
    ticketId: { type: String },
    // ticketId: { type: mongoose.Schema.ObjectId, ref: "Ticket" },
    customerName: { type: String },
    agentName: { type: String },
    replierId: { type: mongoose.Schema.ObjectId, ref: "User" },

    path: {
      type: String,
    },
    mimetype: {
      type: String,
    },
    originalname: { type: String },
    filename: { type: String },
    size: { type: String },
  },

  { timestamps: true }
);

module.exports = mongoose.model("reply", ReplySchema);
