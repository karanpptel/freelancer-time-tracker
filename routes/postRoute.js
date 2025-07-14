import express from "express";
import { createPost, getUserPost, updatePost, deletePost } from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validatePostInput } from "../middleware/validatePostInput.js";

const postRouter = express.Router();

postRouter.post('/createPost', protect, validatePostInput, createPost)
postRouter.get('/my-posts' ,protect, getUserPost)
postRouter.put('/update/:id', protect, validatePostInput, updatePost)
postRouter.delete('/delete/:id', protect, deletePost)

export default postRouter