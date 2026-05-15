import mongoose from "mongoose";
import bcrypt from "bcrypt"; 

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    }, 
    email:{
        type: String, 
        required: true,
        unique: true, 
    },
    password:{
        type:String,
        require: true,
    }
},{timestamps: true});

//using the pre-save hook so the hashing happens automatically. 
userSchema.pre("save", async function () {
    if(!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.comparePassword = async function (userPassword) {
    return bcrypt.compare(userPassword, this.password)
}

const User = mongoose.model("User", userSchema);

export default User;

