const router = require("express").Router();
const customerNoteSchema = require("../models/customerNoteSchema");

// Create Customer Note

router.post("/saveCustomerNote", async function (req, res) {
  const customerNoteId = req.body.customerNoteId;
  const customerNote = req.body.customerNote.replace(/(<([^>]+)>)/gi, "");

  try {
    const query = { customerNoteId: req.body.customerNoteId };
    const update = {
      $set: {
        customerNote: customerNote,
        customerNoteId: req.body.customerNoteId,
      },
    };
    const options = { upsert: true };
    const response = await customerNoteSchema.updateOne(query, update, options);
    res.status(201).json({
      message: "Customer Note Saved Successfully",
      response: response,
    });
  } catch (error) {
    console.log(error);
    // res.status(400).json(`Error: ${error}`);
  }
});

router.get("/getSpecificCustomerNotes", async (req, res) => {
  try {
    const specificCustomerNotes = await customerNoteSchema.findOne({
      customerNoteId: req.query.customerNoteId,
    });

    res.status(201).json({
      specificCustomerNotes: specificCustomerNotes,
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
