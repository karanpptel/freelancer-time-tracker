export const validatePostInput = (req, res, next) => {
    const {title, content, status} = req.body;

    if(!title || !content ){
        return res.status(400).json({message: "Title and content fields are required"});
    }
    
    if(status && !["active", "pasue", "complete"].includes(status)){
        return res.status(400).json({message: "Invalid status value"});
    }

    next();
}