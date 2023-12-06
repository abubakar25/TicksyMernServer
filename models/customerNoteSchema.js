const mongoose = require("mongoose");
const customerNoteSchema = new mongoose.Schema(
  {
    customerNote: { type: String, required: true },
    customerNoteId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("customerNote", customerNoteSchema);
