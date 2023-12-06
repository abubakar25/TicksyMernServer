require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
require("./db/conn");
const router = require("./routes/login");
const cors = require("cors");
const cookiParser = require("cookie-parser");
const port = process.env.PORT || 8010;
const loginRoute = require("./routes/login");
const userRoute = require("./routes/user");
const categoryRoute = require("./routes/category");
const ticketRoute = require("./routes/ticket");
const replyRoute = require("./routes/reply");
const customerNoteRoute = require("./routes/customerNote");

// app.get("/",(req,res)=>{
//     res.status(201).json("server created")
// });

app.use(express.json());
app.use(cookiParser());
// app.use(cors());
app.use(cors({ credentials: true, origin: true }));
app.use(router);

app.use("/api/auth", loginRoute);
app.use("/api/user", userRoute);
app.use("/api/category", categoryRoute);
app.use("/api/ticket", ticketRoute);
app.use("/api/reply", replyRoute);
app.use("/api/customerNote", customerNoteRoute);

mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log("DB Connection Successfull!"))
  .catch((err) => {
    console.log(err);
  });

app.listen(port, () => {
  console.log(`server start at port no : ${port}`);
});
