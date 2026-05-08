const express = require("express");
const userscontroller = require("../controllers/usercontroller");
const router = express.Router();
router.get("/userlist", userscontroller.userlist);
router.get("/singleuserlist/(:id)", userscontroller.singleuserlist);
router.delete("/deleteuser/(:id)", userscontroller.deleteuser);
router.post("/registration", userscontroller.registration);
router.put("/updateuser/:id", userscontroller.imageupload, userscontroller.updateuser);
router.post("/login", userscontroller.login);
router.post("/book-appointment",userscontroller.bookappointment)
router.get("/appointment/(:id)", userscontroller.listAppointment)
router.post("/cancel-appointment", userscontroller.cancelAppointment)
module.exports = router;
