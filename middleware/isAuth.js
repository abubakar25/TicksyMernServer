const jwt = require("jsonwebtoken");
const UserSchema = require("../models/userSchema");

const keysecret = process.env.SECRET_KEY;

const isAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    // console.log("token", token);
    const verifyUser = jwt.verify(token, keysecret);
    // console.log("verifyUser", verifyUser);

    const user = await UserSchema.findOne({ _id: verifyUser._id });
    // console.log(`Console On Auth Function ${user}`);

    if (!user) {
      res.status(201).json({ error: "User not Found" });
    }

    next();
  } catch (error) {
    // res.status(401).send(error.message);
    // console.log(error);
    res.status(401).json({
      error: "Unauthorized no token provided, Please Login To Proceed",
    });
  }
};

module.exports = isAuth;
