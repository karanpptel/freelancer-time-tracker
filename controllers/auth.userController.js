import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";

export const login = async(req,res) => {

    const {email, password} = req.body;

    try {
        if(!email || !password){
            return res.status(400).json({message: "All fields are required"});
        }

        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({ message: "User not found" });
        }

        const isMatch = bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = createtoken(user._id);
        res.status(200).json({ message: "Login successful", token });

    } catch (error) {
        console.error(error);
        res.status(500).json({message: error.message});
    }
}

const createtoken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET)
}

export const register  = async(req,res) => {
    const {username, email, password} = req.body;

    try {
        if(!username || !email || !password){
            return res.status(400).json({message: "All fields are required"});
        }

        //check if user already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });

        if(existingUser){
            return res.status(400).json({message: "User already exists"});
        }

        //validating email format and strong password
        if(!validator.isEmail(email)){
            return res.status(400).json({message: "Please enter a valid email"});
        }

        if(password.length < 8){
            return res.status(400).json({message: "Password is not strong enough"});
        }

        // to encypt the password using bcrypt or hashing password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });
        const user =  await newUser.save();
        const token = createtoken(user._id); 
        res.status(201).json({ message: "User created successfully", token });

    } catch (error) {
        console.error(error);
        res.status(500).json({message: error.message});
    }
}