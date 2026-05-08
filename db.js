const mongoose = require("mongoose");
mongoose.connect("mongodb://0.0.0.0:27017/HealthCare", {});
const userSchema = {
  firstname: {type:String, required:true},
  lastname: {type:String, required:true},
  mobileno: {type:String, required:true},
  email: {type:String, required:true, unique:true},
  password: {type:String, required:true},
  images: {type:String},
  address:{type:Object, default: {line1:'', line2:''}},
  gender:{type:String, default:"Not Selected"},
  dob:{type:Object, default:"Not Selected"},

};
const userModel = mongoose.models.user || mongoose.model("user", userSchema);
module.exports = userModel;
