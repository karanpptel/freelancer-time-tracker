import Project from "../models/projectModel.js";
import User from "../models/userModel.js";

export const createPost = async(req,res) => {
    //  console.log("req.userId:", req.userId);    should show user id
    const {title, content, status} = req.body;

    if(!title || !content ){
        return res.status(400).json({message: "All fields are required"});
    }

    try {
        const user = await User.findById(req.userId);
        if(!user){
            return res.status(401).json({message: "User not found"});
        }

        const createNewPost = new Project({
            title,
            content,
            status,
            author: user._id,
        })
        await createNewPost.save();

        res.status(201).json({message: "Post created successfully"});

    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const getUserPost = async(req,res) => {
    const user = await User.findById(req.userId);

    if(!user){
        return res.status(401).json({message: "User not found"});
    }

    try {
        const userPost = await Project.find({author: user._id});

        if(!userPost){
            return res.status(404).json({message: "Post not found"});
        }
        // console.log(userPost);

        res.status(200).json(userPost);
        
        
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const updatePost = async(req,res) => {

    const {title, content, status} = req.body;

    const postId = req.params.id;
    try {
        const post = await Project.findById(postId);
        //   console.log(post);

        if(!post){
            return res.status(404).json({message: "Post not found"});
        }

        const updatePost = await Project.findByIdAndUpdate(
            postId,
            {
                title: title,
                content: content,
                status: status,
            },
        );
       // console.log(updatePost);

        res.status(200).json({message: "Post updated successfully"});
        
        
    } catch (error) {
        res.status(500).json({message:"Something went wrong" + error.message});
    }

}

export const deletePost = async(req,res) => {
    try {
        const postId = req.params.id;
        //console.log(`Trying to delete post: ${postId}`);

        const deletedPost = await Project.findByIdAndDelete(postId);

        if(!deletedPost){
            return res.status(404).json({message: "Post not found or cannot be deleted"});
        }

        //console.log(`successfully deleted post: ${deletedPost.title}`);
        
        res.status(200).json({message: "Post deleted successfully"});

    } catch (error) {
        console.error(error);
        res.status(500).json({message:"Something went wrong or Delete failed" + error.message});
    }
};