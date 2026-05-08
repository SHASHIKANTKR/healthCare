const express = require("express");

const doctorController = require("../controllers/doctorcontroller")



const docRouter = express.Router();

docRouter.get("/list", doctorController.doctorList)


module.exports = docRouter;
