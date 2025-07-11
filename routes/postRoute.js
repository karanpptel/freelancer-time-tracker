import express from "express";
import { createPost, getUserPost, updatePost, deletePost } from "../controllers/postController.js";

const postRouter = express.Router();

postRouter.post('/createPost', createPost)
postRouter.get('/my-posts', getUserPost)
postRouter.put('/update/:id', updatePost)
postRouter.delete('/delete/:id', deletePost)

export default postRouter