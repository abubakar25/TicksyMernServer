const mongoose = require("mongoose");
const TicketSchema = new mongoose.Schema(
  {
    categoryname: { type: String },
    ticketSubject: { type: String },
    ticketDescription: { type: String },
    categoryimage: { type: String },
    ticketUrl: { type: String },
    ticketFile: { type: String },
    ticketType: { type: String },
    ticketStatus: { type: String },
    originalname: { type: String },
    path: { type: String },
    mimetype: { type: String },
    size: { type: String },

    // Here custId  belongs to That customer who has created the Ticket
    custId: {
      type: String,
    },
    customerId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      // required: true,
    },
    agentAssignedId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      // required: true,
    },

    agentassigned: {
      _id: String,
      firstname: String,
      userImage: String,
    },
    starred: {
      type: Boolean,
      default: false,
    },
    readStatus: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Ticket", TicketSchema);
