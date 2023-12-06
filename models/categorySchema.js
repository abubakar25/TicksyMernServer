const mongoose = require("mongoose");
const CategorySchema = new mongoose.Schema(
  {
    categoryname: { type: String, required: true, unique: true },
    // agentassigned: [{ type: String, required: true }],
    agentassigned: [
      {
        _id: String,
        firstname: String,
        userImage: String,
      },
    ],
    categoryimage: { type: String, required: true },
    categoryType: { type: String },
    openTicket: { type: String },
    closedTicket: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", CategorySchema);
