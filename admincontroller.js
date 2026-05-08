

const multer = require("multer");
const fs = require("fs");
const doctorModel = require("../models/doctorModel");

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



exports.addDoctor = async (req,res) =>{


  try {
    
    const {name, email, password, speciality, degree, experience, about, fees, address} = req.body
    if(!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address){
      return res.json({success:false, message:"missing data"})
    }
    let imageUrl = req.body.images; 

  if (req.file) {
    imageUrl = `/uploads/${req.file.filename}`;
  }
 
    const docData ={
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
      images:imageUrl,
      date:Date.now()
    }
    const newDoctor = new doctorModel(docData)
    await newDoctor.save()
    res.json({success:true, message:"doc added"})

  } catch (error) {
    console.log(error)
    res.json({success:false, message:error.message})

  }
}


exports.adminLogin = async(req, res) =>{

  try {

    const {email,password} = req.body

    if(email === "sujal@gmail.com" && password === "sujal@18"){
      res.json({success:true, message:"login suucessfully"})
    }else{
      res.json({success:false, message:"wrong user"})

    }
    
  } catch (error) {
    console.log(error)
    res.json({success:false, message:error.message})

  }

}

exports.allDoctors = async (req, res) =>{

  try {
  const doctors = await doctorModel.find({}).select('-password')
    res.json({success:true,doctors})


  } catch (error) {
     console.log(error)
    res.json({success:false, message:error.message})

  }
}