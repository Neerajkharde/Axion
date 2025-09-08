import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getRecommendedUsers, getMyFriends, 
    sendFriendRequest, acceptFriendRequest, 
    getFriendRequests, getOutgoingFriendRequests } 
from "../controllers/userController.js";

const router = express.Router();
router.use(protect);

router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);
router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);

router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendRequests);


export default router;