import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    
    try {
        const token = req.cookies.token;

        if(!token){
            return res.status(401).json({success: false, message: "Unauthorised - No Token Provided"});
        }
        
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if(!decodedToken){
            return res.status(401).json({success: false, message: "Unauthorised - Invalid Token"});
        }

        const user = await User.findById(decodedToken.userId).select("-password");
        if(!user){
            return res.status(401).json({success: false, message: "Unauthorised - User Not Found"});
        }

        req.user = user;

        next();
    } catch (error) {
        return res.status(500).json({success: false, message: "Internal Server Error in protected Route"});
    }

}