import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import userRouter from "./routes/userRoute.js";
import postRouter from "./routes/postRoute.js";
import cookieParser from "cookie-parser";


//ejs template engine
//app.set("view engine", "ejs");



const app = express();
dotenv.config();

//middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());



connectDB();


//api endpoints
app.use("/api/users",userRouter)
app.use("/api/posts",postRouter)

app.get("/", (req, res) => {
   log("hello")
})

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})