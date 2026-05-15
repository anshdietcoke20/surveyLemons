import User from "../models/user.js";
import jwt from "jsonwebtoken";

async function handleUserSignUp(req, res){
    const {name, email, password} = req.body;

    const existingUser = await User.findOne({email})
    if(existingUser) 
        return res.status(400).json({error:"Email already  exists!"})

    await User.create({
        name,
        email,
        password,
    })
    return res.redirect("/login")
}

async function handleUserLogin(req,res) {
    const {email, password} = req.body;

    const user = await User.findOne({email});
    if(!user) 
        return res.status(401).json({error:"Invalid credentials"})

    const matchPassword = await user.comparePassword(password);
    if(!matchPassword) 
        return res.status(401).json({error:"Invalid credentials"});

    const token = jwt.sign(
        {userId: user._id, name: user.name},
        process.env.JWT_SECRET,
        {expiresIn: "1d"}
    )

    res.cookie("token", token,{
        httpOnly: true,
        maxAge: 1* 24 * 60 * 60 * 1000
    })

    return res.redirect("/create-poll")
}

export {
    handleUserSignUp, 
    handleUserLogin
}