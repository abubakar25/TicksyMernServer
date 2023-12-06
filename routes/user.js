const UserSchema = require("../models/userSchema");
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
let path = require("path");
const TicketSchema = require("../models/ticketSchema");
const categorySchema = require("../models/categorySchema");
const isAdmin = require("../middleware/isAdmin");
const isAuth = require("../middleware/isAuth");
const requireSignIn = require("../middleware/requireSignIn");
const verifyToken = require("../middleware/verifyToken");
const url =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Antu_im-user-online.svg/1200px-Antu_im-user-online.svg.png";

const maxSize = 1 * 1000 * 1000;

// Get Time According To pakistan Time

let date_ob = new Date();
// current hours
let hours = date_ob.getHours();
// current minutes
let minutes = date_ob.getMinutes();
// current seconds
let seconds = date_ob.getSeconds();
// prints time in HH:MM format
// console.log(hours + ":" + minutes + ":" + seconds);

let time = hours + ":" + minutes + ":" + seconds;
// console.log("time", time);

// Image Multer

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../client/public/userUploads");
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + "-" + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // cb(null, false);
    return cb(
      new Error("Only upload files with jpg, jpeg,webp,gif, png, format.")
    );
  }
};

let upload = multer({ storage, fileFilter });

// Create || Add New User by Admin
router.post(
  "/create",
  upload.single("userImage"),
  requireSignIn,
  isAdmin,
  async (req, res) => {
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;
    const password = req.body.password;
    const cpassword = req.body.cpassword;
    const usertype = req.body.usertype;
    const userImage = req.file.filename;
    const openTicket = "open";
    const closedTicket = "closed";

    if (
      !firstname ||
      !lastname ||
      !email ||
      !password ||
      !cpassword ||
      !usertype ||
      !userImage
    ) {
      return res.status(422).json({ error: "Please Provide All Information" });
    }

    try {
      const userExists = await UserSchema.findOne({ email: email });
      if (userExists) {
        return res.status(422).json({ error: "User Already Exists" });
      } else if (password !== cpassword) {
        res
          .status(422)
          .json({ error: "Password and Confirm Password Don't Match" });
      } else {
        const newUser = new UserSchema({
          firstname,
          lastname,
          email,
          password,
          usertype,
          userImage,
          openTicket,
          closedTicket,
        });
        await newUser.save();
        res.status(201).json({
          message: "User added Successfully",
          user: newUser,
          status: 201,
        });
      }
    } catch (error) {
      console.log(error);
    }
  },
  (error, req, res, next) => {
    if (error) {
      // res.status(500).send(error.message);
      res.status(500).send({ error: error.message });
    }
  }
);

// Get All Users
router.get("/getAllUsers", async (req, res) => {
  try {
    const allUsers = await UserSchema.find();
    res.status(201).json(allUsers);
  } catch (error) {
    res.status(422).json(error);
  }
});
// Get ALL Users Using pagination text
router.get("/allUsers", async (req, res) => {
  const { page = 3, limit = 5 } = req.query;
  try {
    const allUsersCount = await UserSchema.countDocuments();
    const allUsers = await UserSchema.find()
      .limit(limit * 1)
      .skip((page - 1) * limit);
    res.status(201).json({ allUsers: allUsers, allUsersCount: allUsersCount });
  } catch (error) {
    res.status(422).json(error);
  }
});
// Get ALL Customers
router.get("/getAllCustomers", async (req, res) => {
  try {
    const allCustomers = await UserSchema.find({ usertype: "customer" });
    const customersWithTicketsCount = await Promise.all(
      allCustomers.map(async (customer) => {
        const count = await TicketSchema.countDocuments({
          customerId: customer._id,
        });
        return {
          customerId: customer._id,
          customerName: customer.firstname,
          customerEmail: customer.email,
          customerImage: customer.userImage,
          customerStatus: customer.status,
          ticketCount: count,
        };
      })
    );

    // console.log(ticketsCount, "ticketsCount");

    // return ticketsCount;

    // console.log(tickets, "tickets");
    res.status(201).json({ customersWithTicketsCount });
  } catch (error) {
    res.status(422).json(error);
  }
});

// Get All Agents
router.get("/getAllAgentsByConcept", async (req, res) => {
  try {
    const allAgents = await UserSchema.find(
      { usertype: "agent" },
      { _id: 1, firstname: 1, userImage: 1 }
    );

    res.status(201).json({ allAgents: allAgents });
  } catch (error) {
    res.status(422).json(error);
  }
});

// Get Single Agent using Agent Id
router.get("/getSingleAgent", async (req, res) => {
  const agent_Id = req.query.agent_Id;
  try {
    const singleAgent = await UserSchema.findOne(
      { _id: agent_Id },
      { _id: 1, firstname: 1, userImage: 1 }
    );
    res.status(201).json({ singleAgent: singleAgent });
  } catch (error) {
    res.status(422).json(error);
  }
});

router.get("/protected", verifyToken, (req, res) => {
  // This route is protected and can only be accessed if the token is valid and not expired
  res.json({ message: "This is a protected route" });
});

// Get Single User Data

router.get("/getUser/:id", isAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const userIndividual = await UserSchema.findById({ _id: id });
    // console.log(userIndividual);
    res.status(201).json({ user: userIndividual });
  } catch (error) {
    // console.log(error);
    res.status(422).json(error);
  }
});

router.get("/getUserTestForAuthorize/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const userIndividual = await UserSchema.findById({ _id: id });
    // console.log(userIndividual);
    res.status(201).json(userIndividual);
  } catch (error) {
    // console.log(error);
    res.status(422).json(error);
  }
});

// Get Customer Detail Page using  id

router.get("/getCustomer/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await UserSchema.findById({ _id: id });
    res.status(201).json(customer);
  } catch (error) {
    res.status(422).json(error);
  }
});

// Get CustomerData Using Customer Id
router.get("/getCustomerDataWithSpecificId", async (req, res) => {
  try {
    const userIndividual = await UserSchema.findOne({
      _id: req.query.customerId,
    });

    res.status(201).json(userIndividual);
  } catch (error) {
    res.status(422).json(error);
  }
});

// getCustomerDataUsingCusId
router.get("/getCustomerDataUsingCusId", async (req, res) => {
  try {
    const userIndividual = await UserSchema.findOne({
      _id: req.query.customer_Id,
    });

    res.status(201).json(userIndividual);
  } catch (error) {
    res.status(422).json(error);
  }
});

// getAgentDataWithSpecificId
router.get("/getAgentDataWithSpecificId", async (req, res) => {
  try {
    const agentIndividual = await UserSchema.findOne({
      _id: req.query.agent_Id,
    });
    res.status(201).json(agentIndividual);
  } catch (error) {
    res.status(422).json(error);
  }
});

// getLoginUserData
router.get("/getLoginUserData", async (req, res) => {
  try {
    const loginUserData = await UserSchema.findOne({
      _id: req.query.login_id,
    });

    res.status(201).json(loginUserData);
  } catch (error) {
    res.status(422).json(error);
  }
});

// getReplierDataUsingReplierId
router.get("/getReplierDataUsingReplierId", async (req, res) => {
  try {
    const replierData = await UserSchema.findOne({
      _id: req.query.replierId,
    });
    res.status(201).json(replierData);
  } catch (error) {
    res.status(422).json(error);
  }
});
// Update User Data
router.patch("/updateUser/:id", async (req, res) => {
  try {
    const { id } = req.params;
    req.body.password = await bcrypt.hash(req.body.password, 4);
    // console.log("updateRequestBodyPassword", req.body.password);
    const updatedUser = await UserSchema.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.status(201).json(updatedUser);
  } catch (error) {
    res.status(422).json(error);
  }
});

// Delete User by Admin
router.delete("/deleteUser/:id", requireSignIn, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserSchema.findById({ _id: id });
    if (!user) {
      res
        .status(422)
        .json({ error: `User does not exist with Id: ${req.params.id}` });
    }
    await user.remove();
    res.status(200).json({
      message: "User Deleted Successfully",
    });
  } catch (error) {
    res.status(422).json(error);
  }
});

// Update User Status By admin || Block UnBlock User
router.get(
  "/updateUserStatus/:id",
  requireSignIn,
  isAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      const customer = await UserSchema.findById({ _id: id });

      if (!customer) {
        res.status(422).json({ error: "Customer not found" });
        return;
      }

      customer.status = !customer.status;

      await customer.save();

      res.status(201).json({ message: "Customer Status Updated Successfully" });
    } catch (error) {
      // res.status(422).json({ error: "User Not Found " });
      res.status(422).json(error);
    }
  }
);

// Update User Profile
router.patch(
  "/updateUserProfile/:id",
  upload.single("userImage"),
  async (req, res) => {
    await UserSchema.findById(req.params.id)
      .then((user) => {
        user.userImage = req.file.filename;
        user
          .save()
          .then(() => {
            res.json({ userImage: user.userImage, message: "Profile Updated" });
          })
          .catch((err) => res.status(400).json(`Error: ${err}`));
      })
      .catch((err) => res.status(400).json(`Error: ${err}`));
  },
  (error, req, res, next) => {
    if (error) {
      // res.status(500).send(error.message);
      res.status(500).send({ error: error.message });
    }
  }
);
// Create Customer
router.post("/createCustomer", async (req, res) => {
  const firstname = req.body.firstname;
  const lastname = "Mr...";
  const email = req.body.email;
  const password = req.body.password;
  const cpassword = req.body.cpassword;
  const usertype = "customer";
  const userImage = url;

  if (!firstname || !email || !password || !cpassword) {
    return res.status(422).json({ error: "Please Provide All Information" });
  }

  try {
    const customerExists = await UserSchema.findOne({ email: email });
    if (customerExists) {
      return res.status(422).json({ error: "Customer Already Exists" });
    } else if (password !== cpassword) {
      res
        .status(422)
        .json({ error: "Password and Confirm Password Don't Match" });
    } else {
      const newCustomer = new UserSchema({
        firstname,
        lastname,
        email,
        password,
        usertype,
        userImage,
      });
      await newCustomer.save();
      res.status(201).json({
        message: "Customer Registered Successfully",
        customer: newCustomer,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
