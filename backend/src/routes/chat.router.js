import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getStreamToken } from "../controllers/chatController.js";
const router = express.Router();

router.get("/token", protect, getStreamToken);

export default router;