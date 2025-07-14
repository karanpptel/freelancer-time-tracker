import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import userRouter from "./routes/userRoute.js";
import postRouter from "./routes/postRoute.js";
import cookieParser from "cookie-parser";
import timeEntryRouter from "./routes/timeEntryRoute.js";


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
app.use("/api/time", timeEntryRouter)

app.get("/", (req, res) => {
   console.log("hello")
})

// Error handler middleware (must be after all routes)
app.use((err, req, res, next) => {
  console.error(err.stack);  // log full error in console
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error"
  });
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})