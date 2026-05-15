import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({ //each que has their own options and votes arrays 
    question: { 
        type: String,
        required: true
     },
     options:[{
        type:String
     }],
     votes:[{
        type: Number, 
        default: 0
     }],
     required:{
        type: Boolean,
        default: false // if true * shown, que cannot be skipped 
     }
})

const pollSchema = new mongoose.Schema({
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    published: {
      type:Boolean,
      default: false
   },
    questions:[questionSchema] //each poll has an array of questions 
}, {timestamps: true});

const Poll = mongoose.model("Poll", pollSchema)
export default Poll; 