import express from "express";
import {handleCreatePoll, handleGetPoll, handlePublishPoll} from "../controllers/poll.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.post('/create', authMiddleware, handleCreatePoll);
router.get("/api/:id", handleGetPoll)
router.post('/:id/publish', authMiddleware, handlePublishPoll)

export default router ;