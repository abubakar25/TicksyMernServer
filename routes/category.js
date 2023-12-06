const CategorySchema = require("../models/categorySchema");
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const multer = require("multer");
const UserSchema = require("../models/userSchema");
const { v4: uuidv4 } = require("uuid");
let path = require("path");
const ticketSchema = require("../models/ticketSchema");
const requireSignIn = require("../middleware/requireSignIn");
const isAdmin = require("../middleware/isAdmin");

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
    cb(null, "../client/public/categoryUploads");
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

// Create || Add Category

router.post(
  "/create",
  requireSignIn,
  isAdmin,
  upload.single("categoryimage"),
  async (req, res) => {
    const categoryname = req.body.categoryname;
    const agentassigned = JSON.parse(req.body.agentassigned);
    const categoryimage = req.file.filename;
    const categoryType = "General";
    const openTicket = "open";
    const closedTicket = "closed";

    if (!categoryname || !agentassigned || !categoryimage) {
      return res.status(422).json({ error: "Please Provide All Information" });
    }

    try {
      const categoryExists = await CategorySchema.findOne({
        categoryname: categoryname,
      });
      if (categoryExists) {
        return res.status(422).json({ error: "Category Already Exists" });
      } else {
        const newCategory = new CategorySchema({
          categoryname: categoryname,
          agentassigned: agentassigned,
          categoryimage: categoryimage,
          categoryType,
          openTicket,
          closedTicket,
        });
        await newCategory.save();
        res.status(201).json({
          message: "Category added Successfully",
          cat: newCategory,
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

// Get All Categories With Fields
router.get("/getAllCategories", async (req, res) => {
  try {
    const allCategories = await CategorySchema.find(
      { categoryType: "General" },
      {
        _id: 1,
        categoryname: 1,
        categoryimage: 1,
        openTicket: 1,
        closedTicket: 1,
      }
    );

    for (let i = 0; i < allCategories.length; i++) {
      const openTicketCount = await ticketSchema.countDocuments({
        ticketStatus: "open",
        categoryname: allCategories[i].categoryname,
      });
      const readStatusTicketCount = await ticketSchema.countDocuments({
        readStatus: false,
        categoryname: allCategories[i].categoryname,
      });

      allCategories[i].openTicket = openTicketCount;
      allCategories[i].closedTicket = readStatusTicketCount;
    }
    res.status(201).json({
      allCategories: allCategories,
    });
  } catch (error) {
    res.status(422).json(error);
  }
});

// All Tickets Assignet to specific agent with each category

router.get("/getAgentsTicketsAgainstAllCategories", async (req, res) => {
  try {
    const allCategories = await CategorySchema.find({
      categoryType: "General",
    });

    for (let i = 0; i < allCategories.length; i++) {
      const openTicketCount = await ticketSchema.countDocuments({
        ticketStatus: "open",
        "agentassigned._id": req.query.agentId,
        categoryname: allCategories[i].categoryname,
      });
      const readStatusTicketCount = await ticketSchema.countDocuments({
        readStatus: false,
        "agentassigned._id": req.query.agentId,
        categoryname: allCategories[i].categoryname,
      });

      // console.log(openTicketCount);

      allCategories[i].openTicket = openTicketCount;
      allCategories[i].closedTicket = readStatusTicketCount;
    }
    res.status(201).json({
      allCategories: allCategories,
    });
  } catch (error) {
    res.status(422).json(error);
  }
});

// Get Tickets  Against Category for agents
router.get("/getAgentsTicketsAgainstCategory", async (req, res) => {
  try {
    const ticketsCountAgainstCategory = await ticketSchema.countDocuments({
      "agentassigned._id": req.query.agentId,
      categoryname: req.query.categoryname,
    });
    const Tickets = await ticketSchema
      .find({
        "agentassigned._id": req.query.agentId,
        categoryname: req.query.categoryname,
      })
      .populate("customerId", "firstname email usertype userImage");

    res.status(201).json({
      Tickets: Tickets,
      ticketsCountAgainstCategory: ticketsCountAgainstCategory,
    });
    // console.log(Tickets);
  } catch (error) {
    res.status(422).json(error);
  }
});

// Get All Categories With Fields
router.get("/getAllCategoriesWithOutFields", async (req, res) => {
  try {
    const allCategories = await CategorySchema.find({
      categoryType: "General",
    });

    res.status(201).json({
      allCategories: allCategories,
    });
  } catch (error) {
    res.status(422).json(error);
  }
});

// Get All Closed Categories Tickets
let closedCategoryData = {};
let closedCategoryCount = {};
router.get("/getAllClosedCategoriesTickets", async (req, res) => {
  try {
    const allCategories = await CategorySchema.find();

    for (let i = 0; i < allCategories.length; i++) {
      const ticketsCountAgainstCategory = await ticketSchema.countDocuments({
        categoryname: allCategories[i].categoryname,
      });

      const closedTicketCount = await ticketSchema.countDocuments({
        ticketStatus: "closed",
        categoryname: allCategories[i].categoryname,
      });

      closedCategoryData[allCategories[i].categoryname] =
        ticketsCountAgainstCategory;
      closedCategoryCount[allCategories[i].categoryname] = closedTicketCount;
    }
    res.status(201).json({
      allCategories: allCategories,
      categoryData: closedCategoryData,
      closedCount: closedCategoryCount,
    });
  } catch (error) {
    res.status(422).json(error);
  }
});

// Get All Starred Categories Tickets
let starredCategoryData = {};
let starredCategoryCount = {};
router.get("/getAllStarredCategoriesTickets", async (req, res) => {
  try {
    const allCategories = await CategorySchema.find();

    for (let i = 0; i < allCategories.length; i++) {
      const ticketsCountAgainstCategory = await ticketSchema.countDocuments({
        categoryname: allCategories[i].categoryname,
      });

      const closedTicketCount = await ticketSchema.countDocuments({
        starred: true,
        categoryname: allCategories[i].categoryname,
      });

      starredCategoryData[allCategories[i].categoryname] =
        ticketsCountAgainstCategory;
      starredCategoryCount[allCategories[i].categoryname] = closedTicketCount;
    }
    res.status(201).json({
      allCategories: allCategories,
      categoryData: starredCategoryData,
      closedCount: starredCategoryCount,
    });
  } catch (error) {
    res.status(422).json(error);
  }
});

// Get All Categories With Image Name

router.get("/getAllCategoriesWithImageAndName", async (req, res) => {
  try {
    const allCategories = await CategorySchema.find(
      { categoryType: "General" },
      { _id: 1, categoryname: 1, categoryimage: 1 }
    );
    res.status(201).json({ allCategories: allCategories });
    // console.log(allCategories);
  } catch (error) {
    res.status(422).json(error);
  }
});
// Get All Agents From Customer Schema

router.get("/getAllAgents", async (req, res) => {
  try {
    const allAgents = await UserSchema.find(
      { usertype: "agent" },
      { _id: 1, firstname: 1, userImage: 1 }
    );
    res.status(201).json({
      allAgents: allAgents,
    });
  } catch (error) {
    res.status(422).json(error);
  }
});

// Agents Count Of Tickets

router.get("/getAllAgentsWithCounts", async (req, res) => {
  try {
    const allAgents = await UserSchema.find(
      { usertype: "agent" },
      { _id: 1, firstname: 1, userImage: 1, openTicket: 1, closedTicket: 1 }
    );

    for (let i = 0; i < allAgents.length; i++) {
      const openTicketCount = await ticketSchema.countDocuments({
        ticketStatus: "open",
        "agentassigned._id": allAgents[i]._id,
      });
      const closedTicketCount = await ticketSchema.countDocuments({
        readStatus: false,
        "agentassigned._id": allAgents[i]._id,
      });

      allAgents[i].openTicket = openTicketCount;
      allAgents[i].closedTicket = closedTicketCount;

      // console.log("openTickets", openTicketCount);
      // console.log("closed Ticket", closedTicketCount);
    }
    res.status(201).json({
      allAgents: allAgents,
    });
  } catch (error) {
    res.status(422).json(error);
  }
});

// Get All Agents Closed count

router.get("/getAllAgentsWithClosedCounts", async (req, res) => {
  try {
    const allAgents = await UserSchema.find(
      { usertype: "agent" },
      { _id: 1, firstname: 1, userImage: 1, closedTicket: 1 }
    );

    for (let i = 0; i < allAgents.length; i++) {
      const closedTicketCount = await ticketSchema.countDocuments({
        ticketStatus: "closed",
        "agentassigned._id": allAgents[i]._id,
      });

      allAgents[i].closedTicket = closedTicketCount;
    }
    res.status(201).json({
      allAgents: allAgents,
    });
  } catch (error) {
    res.status(422).json(error);
  }
});

router.get("/getAssignedAgents", async (req, res) => {
  // console.log("Here Is OutPut", req.query.categoryname);
  try {
    const allagents = await CategorySchema.find({
      categoryname: req.query.categoryname,
    });
    const categoryImage = await CategorySchema.findOne({
      categoryname: req.query.categoryname,
    });
    // console.log("agents -output", allagents);
    res.status(201).json({
      allagents: allagents,
      categoryImage: categoryImage,
    });
  } catch (error) {
    res.status(422).json(error);
  }
});

router.get("/getallagentsIds", async (req, res) => {
  try {
    const allagents = await UserSchema.find(
      { usertype: "agent" },
      // { _id: 1, firstname: 1 }
      { _id: 1 }
    );
    res.status(201).json(allagents);
    // console.log(allCategories);
  } catch (error) {
    res.status(422).json(error);
  }
});

// Delete Category

router.delete(
  "/deletecategory/:id",
  requireSignIn,
  isAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const deletCategory = await CategorySchema.findByIdAndDelete({ _id: id });
      // console.log(deletCategory);
      res.status(201).json({
        message: "Category Deleted Successfully",
        deletCategory: deletCategory,
      });
    } catch (error) {
      res.status(422).json(error);
    }
  }
);

// Get Single Category Data

router.get("/getcategory/:id", async (req, res) => {
  try {
    // console.log(req.params);
    const { id } = req.params;

    // console.log("id of getCustomer", id);

    const categoryIndividual = await CategorySchema.findById({ _id: id });
    // console.log(categoryIndividual);
    res.status(201).json(categoryIndividual);
  } catch (error) {
    res.status(422).json(error);
  }
});

// Update Category Data
router.patch(
  "/updatecategory/:id",
  requireSignIn,
  isAdmin,
  upload.single("categoryimage"),
  async (req, res) => {
    await CategorySchema.findById(req.params.id)
      .then((cat) => {
        cat.categoryname = req.body.categoryname;
        cat.categoryimage = req.file.filename;
        cat.agentassigned = JSON.parse(req.body.agentassigned);
        cat
          .save()
          .then(() =>
            res.json({ message: "Category Is Updated", status: 200, cat: cat })
          )
          .catch((err) => res.status(400).json(`Error: ${err}`));
      })
      // .catch((err) => res.status(400).json(`Error: ${err}`));
      .catch((error) =>
        res.status(400).json({ error: "Please Upload Image to Proceed" })
      );
  },
  (error, req, res, next) => {
    if (error) {
      // res.status(500).send(error.message);
      res.status(500).send({ error: error.message });
    }
  }
);

module.exports = router;
