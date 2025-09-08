import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";

export async function getRecommendedUsers(req, res) {
    try {
        const userId = req.user._id;
        const currentUser = req.user;
        
        // These Users must not be myself and also not my friends
        const recommendedUsers = await User.find({
            $and: [
                {_id: {$ne: userId}}, // Exclude current user
                {_id: {$nin: currentUser.friends}}, // Exclude currentUser's friends
                {isOnboarded: true},
                // {location: currentUser.location},
            ]
        });
        res.status(200).json(recommendedUsers);

    } catch (error) {
        console.log("Error in fetching recommended users", error);
        res.status(500).json({success: false, message: "Internal Server Error"});
    }
}

export async function getMyFriends(req, res) {
    try {
        
        
        const user = await User.findById(req.user.id)
            .select("friends")
            .populate("friends", "fullName location phone profilePic");


        console.log(user);

        res.status(200).json(user.friends);
        
    } catch (error) {
        console.log("Error in fetching friends", error);
        res.status(500).json({success: false, message: "Internal Server Error"});
    }
}

export async function sendFriendRequest(req, res) {
    try {
        // Checks
        const myId = req.user.id;
        const {id: recipientId} = req.params;
        if(myId === recipientId){
            return res.status(400).json({message: "You cannot send friend request to yourself"});
        }

        const recipient = await User.findById(recipientId);
        if(!recipient){
            return res.status(404).json({message: "Recepient not found"});
        }

        if(recipient.friends.includes(myId)){
            return res.status(400).jason({message: "You are already friend with the recepient"});
        }

        const existingRequest = await FriendRequest.findOne({
            $or: [
                {sender: myId, recipient: recipientId},
                {sender: recipient, recipient: recipientId}
            ],
        });
        if(existingRequest){
            return res.status(400)
                .json({message: "A friend request already exists between you and this user"})
        }

        // Now I can create a Friend Request
        const friendRequest = await FriendRequest.create({
            sender: myId,
            recipient: recipientId,
        });

        res.status(201).json(friendRequest);
    } catch (error) {
        console.log("Error in making a friend request", error);
        res.status(500).json({success: false, message: "Internal Server Error"});
    }
}

export async function acceptFriendRequest(req, res) {
    try {
        const {id: requestId} = req.params;
        const currUserId = req.user._id; 

        const friendRequest = await FriendRequest.findById(requestId);
        if(!friendRequest){
            return res.status(404).json({message: "Friend Request Not Found"});
        }

        if(currUserId.toString() !== friendRequest.recipient.toString()){
            return res.status(403).json({message: "You are not authorised to accept this request"});
        }

        friendRequest.status = "accepted";
        await friendRequest.save();

        await User.findByIdAndUpdate(friendRequest.sender, {
            $addToSet: {friends: friendRequest.recipient},
        });

        await User.findByIdAndUpdate(friendRequest.recipient, {
            $addToSet: {friends: friendRequest.sender},
        });

        res.status(200).json({message: "Friend request Accepted"});
    } catch (error) {
        console.log("Error in accepting friend request", error);
        res.status(500).json({success: false, message: "Internal Server Error"});
    }

}

export async function getFriendRequests(req, res) {
    
    try {
        const incomingReq = await FriendRequest.find({
            recipient: req.user.id,
            status: "pending",
        }).populate("sender", "fullName profilePic location");

        const acceptedReq = await FriendRequest.find({
            sender: req.user.id,
            status: "accepted",
        }).populate("recipient", "fullName profilePic");

        res.status(200).json({incomingReq, acceptedReq})
    } catch (error) {
        console.log("Error in getting friend requests", error);
        res.status(500).json({success: false, message: "Internal Server Error"});
    }
}

export async function getOutgoingFriendRequests(req,res) {
    try {

        const OutgoingReq = await FriendRequest.find({
            sender: req.user.id,
            status: "pending",
        }).populate("recipient", "fullName profilePic location phone");

        res.status(200).json(OutgoingReq);

    } catch (error) {
        console.log("Error in Outgoing Request Controller", error);
        res.status(500).json({success: false, message: "Internal Server Error"});
    }
}