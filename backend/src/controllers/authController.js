import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export async function signUp(req, res){
    const {fullName, email, password} = req.body;

    try {
        if(!email || !password || !fullName){
            return res.state(400).json({success: false, 
                message:"All fields are required"});
        }

        // Password length must be greater than 6
        if(password.length < 6){
            return res.status(400).json({success: false, 
                message:"Password must be 6 characters long"});
        }

        // Email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({success: false, 
                message: "Invalid email format" });
        }

        // Email must be unique
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({success: false, 
                message: "Email already exists ! Use different email" });
        }

        // Random Avatar
        const idx = Math.floor(Math.random() * 100) + 1; 
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

        const newUser = await User.create({
            fullName,
            email, 
            password,
            profilePic: randomAvatar,
        });

        try {
            await upsertStreamUser({
                id: newUser._id.toString(),
                name: newUser.fullName,
                image: newUser.profilePic || "",
            });

            console.log(`Stream User created for: ${newUser.fullName}`)
        } catch (error) {
            console.log(`Error creating Stream User for: ${newUser.fullName}`);
        }

        const jwtToken = jwt.sign({userId:newUser._id}, process.env.JWT_SECRET_KEY, {
            expiresIn: "7d"
        });
        res.cookie("token", jwtToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV==='production',
        });

        res.status(201).json({success: true, user: newUser});

    } catch (error) {
        res.status(500).json({success: false, message: "Error in Signup"});
    }
};

export async function Login (req, res){
    try {
        const{email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({success: false, 
                message:"All fields are required"});
        }

        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({success: false, 
                message: "Invalid email or password" });
        }

        const isPassCorrect = await user.matchPass(password);

        if(!isPassCorrect){
            return res.status(401).json({message:"Invalid email or password"})
        }

        const { password: _, ...userData } = user.toObject();

        const jwtToken = jwt.sign({userId: user._id}, process.env.JWT_SECRET_KEY, {
            expiresIn: "7d"
        });

        res.cookie("token", jwtToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV==='production',
        });

        res.status(200).json({success: true, user: userData, message: "Login successful"});


    } catch (error) {
        res.status(500).json({success: false, message: "Error in Login"});
    }
};

export function Logout (req, res){
    res.clearCookie("token");
    res.status(200).json({success: true, message: "Logout Success"})
}

export async function onboard(req, res) {
    try {
        const userId = req.user._id;

        const {fullName, bio, phone, location} = req.body; 

        if(!fullName || !bio || !phone || !location){
            return res.status(400).json({success: false, 
                message: "All fields are required",
                missingFields: [
                    !fullName && "fullName",
                    !bio && "bio",
                    !phone && "phone",
                    !location && "location",
                ],
            });
        }

        const phoneRegex = /^[0-9]{10,15}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ success: false, message: "Invalid phone number" });
        }

        const updateData = {
            ...req.body,
            isOnboarded: true,
        }
        if (req.body.profilePic) {
            updateData.profilePic = req.body.profilePic;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, {new: true});

        if(!updatedUser){
            return res.status(404).json({message: "User not Found"});
        }

        try {
            await upsertStreamUser({
                id: updatedUser._id.toString(),
                name: updatedUser.fullName,
                image: updatedUser.profilePic || "",
            });

            console.log(`Stream User updated for: ${updatedUser.fullName}`)
        } catch (streamError) {
            console.log("Error in upsertStream", streamError);
            return res.status(500).json({success: false, message: "Error in Onboarding"});
        }

        res.status(201).json({success: true, user: updatedUser,message: "User Onboarded successfully"});

        
    } catch (error) {
        console.log("Onboarding Error", error);
        res.status(500).json({message: "Internal Server Error"});
    }
}