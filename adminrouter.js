const express = require("express");
const adminController = require("../controllers/admincontroller");
const doctorController = require("../controllers/doctorcontroller")
const adminRouter = express.Router();

adminRouter.post("/add-doctor", adminController.imageupload, adminController.addDoctor);
adminRouter.post("/login",adminController.adminLogin)
adminRouter.post("/all-doctors",adminController.allDoctors)
adminRouter.post("/change-availability",doctorController.changeAvailability)
module.exports = adminRouter;
