const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ExamSchema = new Schema({
    name: {
      type: String,
      required: true
    },
    prof_email: {
      type: String,
      required: true
    },
    exam_link: {
      type: String,
      required: true
    },
    
    date_time_start:{
        type: Date,
        required:true
    },
    duration:{
      type: Number,
      required:true
    },
    exam_code:{
      type:String,
      required:true
    }
    
  });
module.exports = User = mongoose.model("exams", ExamSchema);