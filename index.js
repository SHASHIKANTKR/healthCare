

const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const publicDirectory = path.join(__dirname, "./public");
app.use(express.static(publicDirectory));
const port = 8080;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/public", express.static("public"));
mongoose =require("mongoose");
require("./config/db");
app.use(cors());
app.use("/user", require("./routes/userrouter"));
app.use("/doctors", require("./routes/doctorrouter"));
app.use("/admin", require("./routes/adminrouter"))
app.listen(port, (error) => {
  if (error) {
    console.log(error);
  } else {
    console.log(`Server has strated at ${port}`);
  }
});
app.get("/", (req, res) => {
  res.send("port is running on 3000");
});
