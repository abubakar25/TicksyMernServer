const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
let path = require("path");

const ReplySchema = require("../models/replySchema");
const TicketSchema = require("../models/ticketSchema");
const router = require("express").Router();
const UserSchema = require("../models/userSchema");

// New Reply Attachement Code

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      // cb(null, "./files");
      cb(null, "../client/public/replyUploads");
    },
    filename(req, file, cb) {
      cb(null, `${new Date().getTime()}_${file.originalname}`);
    },
    // filename: function (req, file, cb) {
    //   cb(null, uuidv4() + "-" + path.extname(file.originalname));
    // },
  }),
  limits: {
    fileSize: 1000000, // max file size 1MB = 1000000 bytes
  },
  fileFilter(req, file, cb) {
    if (
      !file.originalname.match(
        /\.(jpeg|jpg|png|PNG|webp|gif|pdf|doc|docx|pptx|ppt|txt|xlsx|xls)$/
      )
    ) {
      return cb(
        new Error(
          "Only upload files with jpg, jpeg,webp,gif,pptx,ppt,txt, png, pdf, doc, docx, xslx, xls format."
        )
      );
    }
    cb(undefined, true); // continue with upload
  },
});

// New Reply With Attachment

router.post(
  "/getTicket/:id/createReply",
  upload.single("file"),
  async (req, res) => {
    const ticketId = req.body.ticketId;
    const custId = req.body.custId;
    const replierId = req.body.replierId;
    const agentId = req.body.agentId;
    const agentassigned = req.body.agentassigned;
    const reply = req.body.reply.replace(/(<([^>]+)>)/gi, "");
    // const { path, mimetype } = req.file;
    const path = req.file ? req.file.path : "";
    const mimetype = req.file ? req.file.mimetype : "";
    const originalname = req.file ? req.file.originalname : "";
    const filename = req.file ? req.file.filename : "";
    const size = req.file ? req.file.size : "";

    try {
      const replierData = await UserSchema.findOne(
        { _id: replierId },
        { _id: 1, firstname: 1, userImage: 1 }
      );
      const replierDataType = await UserSchema.findOne({ _id: replierId });

      if (replierDataType.usertype === "customer") {
        await TicketSchema.findById(req.params.id)
          .then((ticket) => {
            ticket.readStatus = false;
            ticket
              .save()
              .then(() => {})
              .catch((err) => res.status(400).json(`Error: ${err}`));
          })
          .catch((err) => res.status(400).json(`Error: ${err}`));
      } else {
        await TicketSchema.findById(req.params.id)
          .then((ticket) => {
            ticket.readStatus = true;
            ticket.agentassigned = replierData;
            ticket
              .save()
              .then(() => {})
              .catch((err) => res.status(400).json(`Error: ${err}`));
          })
          .catch((err) => res.status(400).json(`Error: ${err}`));
      }

      const newReply = new ReplySchema({
        ticketId,
        custId,
        replierId,
        agentId,
        reply,
        path,
        mimetype,
        originalname,
        size,
        filename,
        // media,
      });
      await newReply.save();
      res.status(201).json({
        message: "Reply Added Successfully",
        reply: newReply,
      });
    } catch (error) {
      console.log(error);
    }
  },
  (error, req, res, next) => {
    if (error) {
      res.status(500).send(error.message);
    }
  }
);

// Downdload Attachmment

router.get("/download/:id", async (req, res) => {
  try {
    const file = await ReplySchema.findById(req.params.id);
    res.set({
      "Content-Type": file.mimetype,
    });
    res.sendFile(path.join(__dirname, "..", file.path));
  } catch (error) {
    res.status(400).send("Error while downloading file. Try again later.");
  }
});

// All Replies Created Against TicketId

router.get("/getRepliesAgainstTicketId", async (req, res) => {
  try {
    const allReplies = await ReplySchema.find({
      ticketId: req.query.ticketId,
    })
      .populate("replierId", "firstname email usertype userImage")
      .sort({ _id: -1 });

    res.status(201).json({ allReplies: allReplies });
  } catch (error) {
    console.log(error);
  }
});

// Get Single Reply

router.get("/getReply/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const ReplyIndividual = await ReplySchema.findById({ _id: id }).populate(
      "replierId",
      "firstname email usertype userImage"
    );

    res.status(201).json(ReplyIndividual);
  } catch (error) {
    res.status(422).json(error);
  }
});

// Update Reply

router.patch("/updateReply/:id", async (req, res) => {
  await ReplySchema.findById(req.params.id)
    .then((reply) => {
      reply.reply = req.body.reply.replace(/(<([^>]+)>)/gi, "");
      reply
        .save()
        .then(() => {
          res.json({
            reply: reply.reply,
            message: "Reply Updated Successfully",
          });
        })
        .catch((err) => res.status(400).json(`Error: ${err}`));
    })
    .catch((err) => res.status(400).json(`Error: ${err}`));
});

// count Replies Against Each Ticket

router.get("/countComments", async (req, res) => {
  try {
    const countComments = await ReplySchema.countDocuments({
      ticketId: req.query.ticketId,
    });

    res.status(201).json(countComments);
  } catch (error) {
    console.log(error);
  }
});

// Delete Reply Attachment
router.delete("/deleteReplyAttachment/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const loggedInUser = await UserSchema.findById({
      _id: req.query.login_id,
    });

    const IndividualReply = await ReplySchema.findById({ _id: id }).populate(
      "replierId",
      "firstname email usertype userImage"
    );

    const replierIdObjId = IndividualReply.replierId._id.toString();
    if (
      loggedInUser.usertype != "agent" &&
      replierIdObjId != IndividualReply.custId
    ) {
      res.status(401).json({
        IndividualReply: IndividualReply,
        message: "Attachment could not deleted ",
      });
    } else {
      IndividualReply.originalname = undefined;
      IndividualReply.save();
      res.status(201).json({
        IndividualReply: IndividualReply,
        message: "Attachment deleted Successfully",
      });
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
