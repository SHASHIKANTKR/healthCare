const user = require("../config/db"); 
const multer = require("multer");
const fs = require("fs");
const doctorModel = require("../models/doctorModel");
const userModel = require("../config/db");
const appointmentModel = require("../models/appointmentModel");

const uploadDir = "./public/uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

exports.imageupload = multer({ storage }).single("images");

exports.userlist = async (req, res) => {
  try {
    const allUsers = await user.find();
    res.send({ status: 200, error: "", message: allUsers });
  } catch (error) {
    res.status(500).send({ status: 500, error: error.message });
  }
};

exports.singleuserlist = async (req, res) => {
  try {
    const singleUser = await user.findById(req.params.id);
    if (!singleUser) {
      return res.status(404).send({ status: 404, message: "User not found" });
    }
    res.send({ status: 200, error: "", message: singleUser });
  } catch (error) {
    res.status(500).send({ status: 500, error: error.message });
  }
};

exports.registration = async (req, res) => {
  try {
    const registrationData = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      mobileno: req.body.mobileno,
      email: req.body.email,
      password: req.body.password,
     // gender: req.body.gender,
      //dob: req.body.dob,
      // images: req.body.images || "", // fallback if no image uploaded
    };
    const newUser = new user(registrationData);
    await newUser.save();
    res.send({ status: 200, message: "User registered successfully" });
  } catch (error) {
    res.status(500).send({ status: 500, error: error.message });
  }
};

exports.deleteuser = async (req, res) => {
  try {
    const deletedUser = await user.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).send({ status: 404, message: "User not found" });
    }
    res.send({ status: 200, error: "", message: deletedUser });
  } catch (error) {
    res.status(500).send({ status: 500, error: error.message });
  }
};

exports.updateuser = async (req, res) => {
  let imageUrl = req.body.images;

  if (req.file) {
    imageUrl = `/uploads/${req.file.filename}`; 
  }

  let addressObj;
  try {
    addressObj = JSON.parse(req.body.address);
  } catch {
    addressObj = req.body.address || { line1: "", line2: "" };
  }

  const updateData = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    mobileno: req.body.mobileno,
    address: addressObj,
    dob: req.body.dob,
    gender: req.body.gender,
    images: imageUrl,
  };

  try {
    const updatedUser = await user.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedUser) {
      return res.status(404).send({ status: 404, message: "User not found" });
    }
    res.send({ status: 200, error: "", message: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send({ status: 500, error: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const foundUser = await user.findOne({ email: req.body.email });
    if (!foundUser) {
      return res.send({ status: 200, error: "", message: "wrong user" });
    }

    if (req.body.password === foundUser.password) {
      res.send({ status: 200, error: "", message: foundUser });
    } else {
      res.send({ status: 200, error: "", message: "wrong user" });
    }
  } catch (error) {
    res.status(500).send({ status: 500, error: "Login failed" });
  }
};

exports.bookappointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body;

    const docData = await doctorModel.findById(docId).select('-password');

    

    if (!docData.available) {
      return res.json({ success: false, message: 'Doctor not available' });
    }

    let slots_booked = docData.slots_booked ;

    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: 'Slot not available' });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);

    }

    const userData = await userModel.findById(userId).select('-password');

 

    delete docData.slots_booked;

    const appointmentData = {
      userId,
      docId,
      userData,
      docData, 
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: 'Appointment Booked' });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};




exports.listAppointment = async (req, res) => {
  try {
    const { id } = req.params; 
    const appointments = await appointmentModel
      .find({ userId: id }) 
      .populate('docId'); 
   

    res.json({ success: true, appointments});
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body; 
    const appointmentData = await appointmentModel.findById(appointmentId);

   

    if (appointmentData.userId !== userId) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    
    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

    const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await doctorModel.findById(docId);

    let slots_booked = doctorData.slots_booked;
    
      slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);
      await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    

    res.json({ success: true, message: "Appointment canceled" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};