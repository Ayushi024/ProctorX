const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    userType:{
      type: Boolean,
      required:false
    }
    
  });

module.exports = User = mongoose.model("users", UserSchema);