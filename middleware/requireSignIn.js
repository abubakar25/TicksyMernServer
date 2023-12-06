const jwt = require("jsonwebtoken");
const UserSchema = require("../models/userSchema");

const keysecret = process.env.SECRET_KEY;

const requireSignIn = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    // console.log(token, "token");

    const newToken = token?.split(" ")[1];

    // console.log("token, sign", token);

    const verifytoken = jwt.verify(newToken, keysecret);

    // console.log("verifytoken", verifytoken);

    const verifiedUser = await UserSchema.findOne({ _id: verifytoken._id });

    // console.log("verifiedUser", verifiedUser);

    if (!verifiedUser) {
      throw new Error("user not found");
    }

    req.token = token;
    req.user = verifiedUser;
    req.userId = verifiedUser._id;
    next();
  } catch (error) {
    res.status(401).send(error.message);
    // console.log(error);
    // res.status(401).json({
    //   error: "Unauthorized no token provided, Please Login To Proceed",
    // });
  }
};

module.exports = requireSignIn;
