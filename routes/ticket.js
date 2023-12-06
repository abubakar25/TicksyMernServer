const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
let path = require("path");

const TicketSchema = require("../models/ticketSchema");
const ReplySchema = require("../models/replySchema");
const CategorySchema = require("../models/categorySchema");
const UserSchema = require("../models/userSchema");
const { log } = require("console");
const replySchema = require("../models/replySchema");
const router = require("express").Router();
const url =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Antu_im-user-online.svg/1200px-Antu_im-user-online.svg.png";

// File Handling Using Multer

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "../client/public/ticketUploads");
//   },
//   filename: function (req, file, cb) {
//     cb(null, uuidv4() + "-" + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage, storage });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../client/public/ticketUploads");
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
    "text/plain",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
    // return cb(new Error("Only images are allowed"));
  }
};

let upload = multer({ storage, fileFilter });

// Create Ticket

router.post("/createTicket", upload.single("ticketFile"), async (req, res) => {
  const agentassigned = JSON.parse(req.body.agentassigned);
  const categoryname = req.body.categoryname;
  const ticketSubject = req.body.ticketSubject;
  const categoryimage = req.body.categoryimage;
  const customerId = req.body.customerId;
  const agentAssignedId = JSON.parse(req.body.agentAssignedId);
  const ticketDescription = req.body.ticketDescription.replace(
    /(<([^>]+)>)/gi,
    ""
  );
  const custId = req.body.custId;
  const ticketUrl = req.body.ticketUrl ? req.body.ticketUrl : "";
  const ticketFile = req.file ? req.file.filename : "";
  const originalname = req.file ? req.file.originalname : "";
  const path = req.file ? req.file.path : "";
  const mimetype = req.file ? req.file.mimetype : "";
  const size = req.file ? req.file.size : "";
  const ticketType = "Private";
  const ticketStatus = req.body.ticketStatus ? req.body.ticketStatus : "open";
  const readStatus = false;

  try {
    const newTicket = new TicketSchema({
      agentassigned,
      categoryname,
      ticketSubject,
      ticketDescription,
      custId,
      customerId,
      ticketUrl,
      ticketFile,
      ticketType,
      ticketStatus,
      originalname,
      path,
      mimetype,
      size,
      readStatus,
      agentAssignedId,
      categoryimage,
    });
    await newTicket.save();
    res.status(201).json({
      message: "Ticket Created Successfully",
      status: 201,
      ticket: newTicket,
    });
  } catch (error) {
    console.log(error);
  }
});

// Create Ticket of Customer By or Agent

// Create Ticket And Register User Final Working Api

router.post(
  "/createTicketAndRegisterUserFinal",
  upload.single("ticketFile"),
  async (req, res) => {
    console.log(req.body);
    const agentassigned = JSON.parse(req.body.agentassigned);
    const categoryname = req.body.categoryname;
    const ticketSubject = req.body.ticketSubject;
    const categoryimage = req.body.categoryimage;
    const custId = req.body.custId;
    const agentAssignedId = JSON.parse(req.body.agentAssignedId);
    const ticketDescription = req.body.ticketDescription.replace(
      /(<([^>]+)>)/gi,
      ""
    );

    const ticketUrl = req.body.ticketUrl;
    const ticketFile = req.file ? req.file.filename : "";
    const originalname = req.file ? req.file.originalname : "";
    const path = req.file ? req.file.path : "";
    const mimetype = req.file ? req.file.mimetype : "";
    const size = req.file ? req.file.size : "";
    const ticketType = "Private";
    const ticketStatus = "open";
    const readStatus = false;
    const firstname = req.body.firstname;
    const lastname = "Mr ...";
    const email = req.body.email;
    const password = req.body.password;
    const cpassword = req.body.cpassword;
    const usertype = req.body.usertype;

    if (!firstname || !email || !password || !cpassword) {
      return res
        .status(422)
        .json({ error: "Please Provide All User Information" });
    }

    if (!ticketSubject || !ticketDescription) {
      return res.status(422).json({ error: "Ticket information is required" });
    }

    const userExists = await UserSchema.findOne({ email: email });

    if (userExists) {
      return res.status(422).json({ error: "User Already Exists" });
    }

    if (password !== cpassword) {
      return res
        .status(422)
        .json({ error: "Password and Confirm Password Don't Match" });
    }

    try {
      if (custId) {
        const newTicket = new TicketSchema({
          agentassigned,
          categoryname,
          ticketSubject,
          ticketDescription,
          custId,
          ticketUrl,
          ticketFile,
          ticketType,
          ticketStatus,
          originalname,
          path,
          mimetype,
          size,
          readStatus,
          agentAssignedId,
          categoryimage,
        });
        await newTicket.save();
        res.status(201).json({
          message: "Ticket Created Successfully",
          ticket: newTicket,
        });
      } else {
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
            cpassword,
            usertype,
          });
          await newUser.save();
          res.status(201).json({
            message: "User added Successfully",
            user: newUser,
          });
          const newTicket = new TicketSchema({
            agentassigned,
            categoryname,
            ticketSubject,
            ticketDescription,
            custId,
            ticketUrl,
            ticketFile,
            ticketType,
            ticketStatus,
            originalname,
            path,
            mimetype,
            size,
            readStatus,
            agentAssignedId,
            categoryimage,
          });
          await newTicket.save();
          res.status(201).json({
            message: "Ticket Created Successfully",
            ticket: newTicket,
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
);

// Kamran api

router.post(
  "/createTicketAndRegisterUserKamran",
  upload.single("ticketFile"),
  async (req, res) => {
    const agentassigned = req.body.agentassigned;
    const categoryname = req.body.categoryname;
    const ticketSubject = req.body.ticketSubject;
    const categoryimage = req.body.categoryimage;
    // const custId = req.body.custId;
    let custId = "";
    const userImage = url;

    const agentAssignedId = req.body.agentAssignedId;
    // console.log(agentAssignedId,"agentAssignedId");
    const ticketDescription = req.body.ticketDescription.replace(
      /(<([^>]+)>)/gi,
      ""
    );

    const ticketUrl = req.body.ticketUrl;
    const ticketFile = req.file ? req.file.filename : "";
    const originalname = req.file ? req.file.originalname : "";
    const path = req.file ? req.file.path : "";
    const mimetype = req.file ? req.file.mimetype : "";
    const size = req.file ? req.file.size : "";
    const ticketType = "Private";
    const ticketStatus = "open";
    const readStatus = false;
    const firstname = req.body.firstname;
    const lastname = "Mr ...";
    const email = req.body.email;
    const password = req.body.password;
    const cpassword = req.body.cpassword;
    const usertype = req.body.usertype;
    let customerId = "";

    try {
      const userExists = await UserSchema.findOne({ email: email });
      // console.log(userExists,'user exits');
      custId = userExists?._id;
      customerId = userExists?._id;
      if (userExists) {
        const newTicket = new TicketSchema({
          agentassigned,
          categoryname,
          ticketSubject,
          ticketDescription,
          custId,
          customerId,
          ticketUrl,
          ticketFile,
          ticketType,
          ticketStatus,
          originalname,
          path,
          mimetype,
          size,
          readStatus,
          agentAssignedId,
          categoryimage,
        });
        await newTicket.save();
        res.status(201).json({
          message: "Ticket Created Successfully",
          ticket: newTicket,
        });
      } else {
        const newUser = new UserSchema({
          firstname,
          lastname,
          email,
          password,
          cpassword,
          usertype,
          userImage,
        });
        await newUser.save();

        const newTicket = new TicketSchema({
          agentassigned,
          categoryname,
          ticketSubject,
          ticketDescription,
          custId,
          customerId,
          ticketUrl,
          ticketFile,
          ticketType,
          ticketStatus,
          originalname,
          path,
          mimetype,
          size,
          readStatus,
          agentAssignedId,
          categoryimage,
        });
        await newTicket.save();
        res.status(201).json({
          message: "Customer Registered Successfully",
          ticket: newTicket,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
);

// All Tickets

router.get("/getAllTickets", async (req, res) => {
  // const count = await TicketSchema.countDocuments();
  // console.log("count", count);
  try {
    const allTickets = await TicketSchema.find();
    const count = await TicketSchema.countDocuments();
    res.status(201).json({ allTickets: allTickets, count: count });
    // console.log("All Tickets", allTickets);
  } catch (error) {
    console.log(error);
  }
});

// Get Open Tickets Count

router.get("/getOpenTickets", async (req, res) => {
  try {
    const count = await TicketSchema.countDocuments({ ticketStatus: "open" });
    const ReadCount = await TicketSchema.countDocuments({ readStatus: false });
    const openTickets = await TicketSchema.find({
      ticketStatus: "open",
    })
      .populate("customerId", "firstname email usertype userImage")
      .sort({ _id: -1 });

    res
      .status(201)
      .json({ openTickets: openTickets, count: count, ReadCount: ReadCount });
    // console.log(openTickets);
  } catch (error) {
    res.status(422).json(error);
  }
});

// Get ReadStatus Tickets Count
router.get("/getReadStatusTicketsCount", async (req, res) => {
  try {
    const ReadCount = await TicketSchema.countDocuments({ readStatus: false });

    res.status(201).json({ ReadCount: ReadCount });
    // console.log(ReadCount);
  } catch (error) {
    res.status(422).json(error);
  }
});

router.get("/getClosedTickets", async (req, res) => {
  try {
    const closedTicketsCount = await TicketSchema.countDocuments({
      ticketStatus: "closed",
    });

    const closedTickets = await TicketSchema.find({
      ticketStatus: "closed",
    })
      .populate("customerId", "firstname email usertype userImage")
      .sort({ _id: -1 });
    res.status(201).json({
      closedTickets: closedTickets,
      closedTicketsCount: closedTicketsCount,
    });
    // console.log(allCategories);
  } catch (error) {
    res.status(422).json(error);
  }
});

// get StarredTickets

router.get("/getStarredTickets", async (req, res) => {
  try {
    // const starredCount = await TicketSchema.countDocuments({ starred: true });
    const starredCount = await TicketSchema.countDocuments({
      starred: true,
    });
    const starredTickets = await TicketSchema.find({ starred: true })
      .populate("customerId", "firstname email usertype userImage")
      .sort({ _id: -1 });
    res
      .status(201)
      .json({ starredTickets: starredTickets, starredCount: starredCount });
    // console.log(starredTickets);
  } catch (error) {
    res.status(422).json(error);
  }
});
// Get Tickets  Against Category
router.get("/getTicketsAgainstCategory", async (req, res) => {
  try {
    const ticketsCountAgainstCategory = await TicketSchema.countDocuments({
      categoryname: req.query.categoryname,
    });
    const Tickets = await TicketSchema.find({
      categoryname: req.query.categoryname,
    }).populate("customerId", "firstname email usertype userImage");

    res.status(201).json({
      Tickets: Tickets,
      ticketsCountAgainstCategory: ticketsCountAgainstCategory,
    });
    // console.log(Tickets);
  } catch (error) {
    res.status(422).json(error);
  }
});

// Get close Tickets Against Category

router.get("/getClosedTicketsAgainstCategory", async (req, res) => {
  try {
    const ticketsCountAgainstCategory = await TicketSchema.countDocuments({
      ticketStatus: "closed",
      categoryname: req.query.categoryname,
    });
    const Tickets = await TicketSchema.find({
      ticketStatus: "closed",
      categoryname: req.query.categoryname,
    }).populate("customerId", "firstname email usertype userImage");

    res.status(201).json({
      Tickets: Tickets,
      ticketsCountAgainstCategory: ticketsCountAgainstCategory,
    });
    // console.log(Tickets);
  } catch (error) {
    res.status(422).json(error);
  }
});

// Get starred Tickets Against Category

router.get("/getStarredTicketsAgainstCategory", async (req, res) => {
  try {
    const ticketsCountAgainstCategory = await TicketSchema.countDocuments({
      starred: true,
      categoryname: req.query.categoryname,
    });
    const Tickets = await TicketSchema.find({
      starred: true,
      categoryname: req.query.categoryname,
    }).populate("customerId", "firstname email usertype userImage");

    res.status(201).json({
      Tickets: Tickets,
      ticketsCountAgainstCategory: ticketsCountAgainstCategory,
    });
    // console.log(Tickets);
  } catch (error) {
    res.status(422).json(error);
  }
});

// Get Tickets Against AgentId for Agents

router.get("/getTicketsAgainstAgentId", async (req, res) => {
  try {
    const agentTicketsOpenCount = await TicketSchema.countDocuments({
      ticketStatus: "open",
      "agentassigned._id": req.query.agentId,
    });
    const Tickets = await TicketSchema.find({
      ticketStatus: "open",
      "agentassigned._id": req.query.agentId,
    })
      .populate("customerId", "firstname email usertype userImage")
      .sort({ _id: -1 });

    res.status(201).json({
      Tickets: Tickets,
      agentTicketsOpenCount: agentTicketsOpenCount,
    });
  } catch (error) {
    res.status(422).json(error);
  }
});

// Get Closed Tickets Aganist Agent Id

router.get("/getClosedTicketsAgainstAgentId", async (req, res) => {
  try {
    const closedTicketsCount = await TicketSchema.countDocuments({
      ticketStatus: "closed",
      "agentassigned._id": req.query.agentId,
    });
    const Tickets = await TicketSchema.find({
      ticketStatus: "closed",
      "agentassigned._id": req.query.agentId,
    }).populate("customerId", "firstname email usertype userImage");

    res.status(201).json({
      Tickets: Tickets,
      closedTicketsCount: closedTicketsCount,
    });
  } catch (error) {
    res.status(422).json(error);
  }
});

// Get Single Ticket Data

router.get("/getTicket/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // const Replies = await replySchema.find({
    //   ticketId: id,
    // });
    // // console.log(Replies, ">>>>>>>>>>>>");

    const TicketIndividual = await TicketSchema.findById({ _id: id })
      .populate("customerId", "firstname email usertype userImage")
      .populate("agentAssignedId", "firstname userImage");
    res.status(201).json({ TicketIndividual: TicketIndividual });
  } catch (error) {
    res.status(422).json(error);
  }
});

// Delete Ticket
router.delete("/deleteTicket/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const TicketIndividual = await TicketSchema.findByIdAndDelete({ _id: id });
    res.status(201).json(TicketIndividual);
  } catch (error) {
    res.status(422).json(error);
  }
});

// Delete Ticket Attachment
router.delete("/deleteTicketAttachment/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const TicketIndividual = await TicketSchema.findById({ _id: id });
    if (TicketIndividual.originalname != "") {
      TicketIndividual.originalname = undefined;
      TicketIndividual.save();
    }
    res.status(201).json({
      TicketIndividual: TicketIndividual,
      message: "Ticket Attachement deleted Successfully",
    });
  } catch (error) {
    res.status(422).json(error);
  }
});

// Test Parms Code
router.get("/testParams", async (req, res) => {
  try {
    const allTickets = await TicketSchema.find({
      customerId: req.query.userId,
    });
    res.status(201).json({ tickets: allTickets });
  } catch (error) {
    console.log(error);
  }
});

// getSpecificCustomerTickets
router.get("/getSpecificCustomerTickets", async (req, res) => {
  try {
    const customerTicketsCount = await TicketSchema.countDocuments({
      custId: req.query.custId,
    });
    const allTickets = await TicketSchema.find({
      custId: req.query.custId,
    })
      .populate("customerId", "firstname email usertype userImage")
      .sort({ _id: -1 });

    res.status(201).json({
      allTickets: allTickets,
      customerTicketsCount: customerTicketsCount,
    });
  } catch (error) {
    console.log(error);
  }
});

// getCustomer Tickets

router.get("/getCustomerTickets", async (req, res) => {
  try {
    const customerTicketsCount = await TicketSchema.countDocuments({
      custId: req.query.id,
    });
    const allTickets = await TicketSchema.find({
      custId: req.query.id,
    })
      .populate("customerId", "firstname email usertype userImage")
      .sort({ _id: -1 });

    res.status(201).json({
      allTickets: allTickets,
      customerTicketsCount: customerTicketsCount,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/getSpecificAgentsTickets", async (req, res) => {
  try {
    const allTickets = await TicketSchema.find({
      "agentassigned._id": req.query.agentId,
    })
      .populate("customerId", "firstname email usertype userImage")
      .sort({ _id: -1 });

    const count = await TicketSchema.countDocuments({
      "agentassigned._id": req.query.agentId,
    });

    res.status(201).json({ allTickets: allTickets, count: count });
  } catch (error) {
    console.log(error);
  }
});

router.get("/allClosedTicketsCount", async (req, res) => {
  try {
    const closeTicketsCount = await TicketSchema.countDocuments({
      ticketStatus: req.query.ticketStatus,
    });

    res.status(201).json({ closeTicketsCount: closeTicketsCount });
  } catch (error) {
    console.log(error);
  }
});

// Get Tickets Count against Category
router.get("/ticketsCountAgainstCategory", async (req, res) => {
  try {
    const ticketsCountAgainstCategory = await TicketSchema.countDocuments({
      categoryname: "Xertio Theme",
    });

    res
      .status(201)
      .json({ ticketsCountAgainstCategory: ticketsCountAgainstCategory });
  } catch (error) {
    console.log(error);
  }
});

router.get("/ticketsCountAgainstCategory", async (req, res) => {
  try {
    const ticketsCountAgainstCategory = await TicketSchema.countDocuments({
      categoryname: "Xertio Theme",
    });

    res
      .status(201)
      .json({ ticketsCountAgainstCategory: ticketsCountAgainstCategory });
  } catch (error) {
    console.log(error);
  }
});

// update Ticket Status
router.patch("/updateTicket/:id", async (req, res) => {
  await TicketSchema.findById(req.params.id)
    .then((ticket) => {
      ticket.ticketStatus = req.body.ticketStatus;
      ticket
        .save()
        .then(() => {
          res.json({
            ticketStatus: ticket.ticketStatus,
            message: "Ticket Status Updated ",
          });
        })
        .catch((err) => res.status(400).json(`Error: ${err}`));
    })
    .catch((err) => res.status(400).json(`Error: ${err}`));
});

// update assigenedAgents

router.patch("/updateTicketAgentAssigned/:id", async (req, res) => {
  await TicketSchema.findById(req.params.id)
    .then((ticket) => {
      ticket.agentassigned = req.body.agentassigned;
      ticket
        .save()
        .then(() => {
          res.json({
            message: "Agent Assigned  Updated ",
            ticket: ticket,
          });
        })
        .catch((err) => res.status(400).json(`Error: ${err}`));
    })
    .catch((err) => res.status(400).json(`Error: ${err}`));
});

// Update Ticket Subject By Customer

router.patch("/updateTicketDescription/:id", async (req, res) => {
  await TicketSchema.findById(req.params.id)
    .then((ticket) => {
      ticket.ticketDescription = req.body.ticketDescription.replace(
        /(<([^>]+)>)/gi,
        ""
      );
      ticket
        .save()
        .then(() => {
          res.json({
            message: "Comment Updated Successfully",
            ticket: ticket,
          });
        })
        .catch((err) => res.status(400).json(`Error: ${err}`));
    })
    .catch((err) => res.status(400).json(`Error: ${err}`));
});

// update TicketCategoryByAgent

router.patch("/updateTicketCategoryByAgent/:id", async (req, res) => {
  await TicketSchema.findById(req.params.id)
    .then((ticket) => {
      ticket.categoryname = req.body.categoryname.categoryname;
      ticket.categoryimage = req.body.categoryname.categoryimage;

      ticket
        .save()
        .then(() => {
          res.json({
            message: "Category  Updated Successfully",
            ticket: ticket,
          });
        })
        .catch((err) => res.status(400).json(`Error: ${err}`));
    })
    .catch((err) => res.status(400).json(`Error: ${err}`));
});

// update Ticket Starred
router.patch("/updateTicketStarred/:id", async (req, res) => {
  await TicketSchema.findById(req.params.id)
    .then((ticket) => {
      ticket.starred = req.body.star;
      ticket
        .save()
        .then(() => {
          res.json({
            ticketStarred: ticket.starred,
            message: "Added To Starred Tickets",
          });
        })
        .catch((err) => res.status(400).json(`Error: ${err}`));
    })
    .catch((err) => res.status(400).json(`Error: ${err}`));
});

// Downdload Attachmment

router.get("/download/:id", async (req, res) => {
  try {
    const file = await TicketSchema.findById(req.params.id);
    res.set({
      "Content-Type": file.mimetype,
    });
    res.sendFile(path.join(__dirname, "..", file.path));
  } catch (error) {
    res.status(400).send("Error while downloading file. Try again later.");
  }
});

// Checking Reply by Customer Or agent and Update Read Status of Ticket:

// router.post("/updateReadStatus:/id", async (req, res) => {
//   try {
//     const replierData = await UserSchema.findOne({
//       _id: req.query.replierId,
//     });

//     if (replierData.usertype === "customer") {
//       await TicketSchema.findById(req.params.id)
//         .then((ticket) => {
//           ticket.readStatus = false;
//           ticket
//             .save()
//             .then(() => {
//               // console.log("customer Status", ticket.readStatus);
//             })
//             .catch((err) => res.status(400).json(`Error: ${err}`));
//         })
//         .catch((err) => res.status(400).json(`Error: ${err}`));
//     } else {
//       await TicketSchema.findById(req.params.id)
//         .then((ticket) => {
//           ticket.readStatus = true;
//           ticket
//             .save()
//             .then(() => {
//               // console.log("Agent Status", ticket.readStatus);
//             })
//             .catch((err) => res.status(400).json(`Error: ${err}`));
//         })
//         .catch((err) => res.status(400).json(`Error: ${err}`));
//     }

//     res.status(201).json(replierData);
//   } catch (error) {
//     res.status(422).json(error);
//   }
// });

module.exports = router;
