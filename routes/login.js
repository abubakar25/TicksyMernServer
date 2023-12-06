const express = require("express");
const router = new express.Router();
var bcrypt = require("bcryptjs");
const authenticate = require("../middleware/authenticate");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const UserSchema = require("../models/userSchema");
const isAdmin = require("../middleware/isAdmin");
const verifyToken = require("../middleware/verifyToken");
const keysecret = process.env.SECRET_KEY;

// email config

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

// user Login

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(422).json({ error: "Fill all the details" });
  }

  try {
    const userValid = await UserSchema.findOne({ email: email });

    if (userValid) {
      const isMatch = await bcrypt.compare(password, userValid.password);

      if (!isMatch) {
        res.status(422).json({ error: "Password incorrect" });
      } else {
        // token generate
        const token = await userValid.generateAuthtoken();

        // console.log("login-token", token);

        // cookiegenerate
        const test = res.cookie("LoginCookie", token, {
          expires: new Date(Date.now() + 7200000),
          // expires: new Date(Date.now() + 9000000),
          httpOnly: true,
        });

        // console.log(test);

        const result = {
          userValid,
          token,
        };
        res.status(201).json({ message: "Login Successfully", result });
      }
    } else {
      res.status(422).json({ status: 422, error: "Invalid Email" });
    }
  } catch (error) {
    console.log(error);
  }
});

// user valid
router.get("/validuser", authenticate, async (req, res) => {
  try {
    const ValidUserOne = await UserSchema.findOne({ _id: req.userId });
    res.status(201).json({ status: 201, ValidUserOne });
  } catch (error) {
    // res.status(401).json({ status: 401, error });
    console.log(error);
  }
});

// user logout

router.get("/logout", authenticate, async (req, res) => {
  try {
    req.rootUser.tokens = req.rootUser.tokens.filter((curelem) => {
      return curelem.token !== req.token;
    });

    res.clearCookie("LoginCookie", { path: "/" });

    req.rootUser.save();

    res.status(201).json({ status: 201, message: "User Logout Successfully" });
  } catch (error) {
    // res.status(401).json({ status: 401, error });
    console.log(error);
  }
});

// send email Link For reset Password
router.post("/sendpasswordlink", async (req, res) => {
  console.log(req.body);

  const { email } = req.body;

  if (!email) {
    res.status(401).json({ status: 401, message: "Enter Your Email" });
  }

  try {
    const userfind = await UserSchema.findOne({ email: email });

    // token generate for reset password
    const token = jwt.sign({ _id: userfind._id }, keysecret, {
      expiresIn: "300s",
    });

    const setusertoken = await UserSchema.findByIdAndUpdate(
      { _id: userfind._id },
      { verifytoken: token },
      { new: true }
    );

    if (setusertoken) {
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Sending Email For password Reset",
        text: `This Link Valid For 5 MINUTES http://localhost:3000/#/forgotpassword/${userfind.id}/${setusertoken.verifytoken}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("error", error);
          res.status(401).json({ status: 401, message: "email not send" });
        } else {
          console.log("Email sent", info.response);
          res
            .status(201)
            .json({ status: 201, message: "Email sent Succsfully" });
        }
      });
    }
  } catch (error) {
    res.status(401).json({ status: 401, message: "invalid user" });
  }
});

// verify user for forgot password time
router.get("/forgotpassword/:id/:token", async (req, res) => {
  const { id, token } = req.params;

  try {
    const validuser = await UserSchema.findOne({
      _id: id,
      verifytoken: token,
    });

    const verifyToken = jwt.verify(token, keysecret);

    // console.log(verifyToken);

    if (validuser && verifyToken._id) {
      res.status(201).json({ status: 201, validuser });
    } else {
      res.status(401).json({ status: 401, message: "user not exist" });
    }
  } catch (error) {
    // res.status(401).json({ status: 401, error });
    console.log(error);
  }
});

// change password

router.post("/:id/:token", async (req, res) => {
  const { id, token } = req.params;

  const { password } = req.body;

  try {
    const validuser = await UserSchema.findOne({
      _id: id,
      verifytoken: token,
    });

    const verifyToken = jwt.verify(token, keysecret);

    if (validuser && verifyToken._id) {
      const newpassword = await bcrypt.hash(password, 12);

      const setnewuserpass = await UserSchema.findByIdAndUpdate(
        { _id: id },
        { password: newpassword }
      );

      setnewuserpass.save();
      res.status(201).json({ status: 201, setnewuserpass });
    } else {
      res.status(401).json({ status: 401, message: "user not exist" });
    }
  } catch (error) {
    res.status(401).json({ error: "Token Expired Generate New Link" });
    console.log("Expire Error", error);
  }
});

// get Token From Cookies

router.get("/private", isAdmin, (req, res) => {
  // console.log(`Console on Private Server  ${req.cookies.LoginCookie}`);
  res.status(201).send("welcome To Private Route");
});

// checking admin is logged in or not

router.get("/isAdminAccess", isAdmin, (req, res) => {
  // console.log(`Console on Private Server  ${req.cookies.LoginCookie}`);
  res.status(201).send("Welome here Mr Admin");
});
// verify Token

router.get("/verifyTok", verifyToken, (req, res) => {
  // console.log(`Console on Private Server  ${req.cookies.LoginCookie}`);
  res.status(201).send("Verified user");
});

module.exports = router;

// 2 way connection
// 12345 ---> e#@$hagsjd
// e#@$hagsjd -->  12345

// hashing compare
// 1 way connection
// 1234 ->> e#@$hagsjd
// 1234->> (e#@$hagsjd,e#@$hagsjd)=> true
