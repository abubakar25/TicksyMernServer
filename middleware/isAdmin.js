const jwt = require("jsonwebtoken");
const UserSchema = require("../models/userSchema");

const keysecret = process.env.SECRET_KEY;

const isAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    const newToken = token?.split(" ")[1];

    // console.log(token, "token");

    const verifyUser = jwt.verify(newToken, keysecret);
    // console.log(verifyUser, "verifyUser");

    const user = await UserSchema.findOne({ _id: verifyUser._id });

    // console.log(user, "user");

    if (user.usertype !== "admin") {
      return res.status(201).json({
        success: false,
        status: 401,
        message: "Unauthorize Access, Only Admin can do this action",
      });
    } else {
      next();
    }
  } catch (error) {
    res.status(401).send(error.message);

    // res.status(401).json({
    //   success: false,
    //   error,
    //   message: "Error in Admin Middleware",
    // });
  }
};

module.exports = isAdmin;
