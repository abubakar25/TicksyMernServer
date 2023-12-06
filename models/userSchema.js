const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const TicketSchema = require("./ticketSchema");
const url =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Antu_im-user-online.svg/1200px-Antu_im-user-online.svg.png";

const keysecret = process.env.SECRET_KEY;

const UserSchema = new mongoose.Schema(
  {
    firstname: { type: String },
    lastname: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    usertype: { type: String },
    userImage: { type: String },
    openTicket: { type: String },
    closedTicket: { type: String },
    status: {
      type: Boolean,
      default: true, // Set the default value for the 'status' field
    },

    lastLogin: {
      type: Date,
      default: Date.now,
    },
    signedUp: {
      type: Date,
      default: Date.now,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    verifytoken: {
      type: String,
    },
  },
  { timestamps: true }
);

// db.getCollection('collectionName').find({timestamp : {$gte: new Date().getTime()-(60*60*1000) } } )

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 4);
  }
  next();
});

UserSchema.pre("remove", async function (next) {
  try {
    await TicketSchema.deleteMany({ customerId: this._id });
    next();
  } catch (error) {
    console.error("Error deleting associated tickets:", error.message);
    next(error);
  }
});

// token generate
UserSchema.methods.generateAuthtoken = async function () {
  try {
    let token23 = jwt.sign({ _id: this._id }, keysecret, {
      expiresIn: "6h",
    });

    this.tokens = this.tokens.concat({ token: token23 });
    await this.save();
    return token23;
  } catch (error) {
    res.status(422).json(error);
  }
};

module.exports = mongoose.model("User", UserSchema);
