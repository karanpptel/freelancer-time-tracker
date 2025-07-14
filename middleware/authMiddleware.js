import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
    
    const authHeader = req.headers.authorization;
    //console.log("AUTH HEADER:", authHeader);
    

    if(!authHeader && !authHeader.startsWith("Bearer ")){
        return res.status(401).json({message: "Unauthorized or token not found"});
    }

    const token = authHeader.split(" ")[1];
    try {
        //console.log("TOKEN:", token);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
       // console.log("DECODED:", decoded);

        req.userId = decoded.id;  // <-- this makes req.user available in controller
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({message: "Unauthorized or invalid token"});
    }
}