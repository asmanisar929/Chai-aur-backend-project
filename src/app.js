import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
app.use(
  //use used for middlewares and configurations
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true, //to allow cookies to be sent with requests
  })
);

app.use(
  express.json({
    limit: "10mb",
  })
); //to parse json data from request body

app.use(express.urlencoded({ extended: true })); //to parse urlencoded data from request body
app.use(express.static("public")); //to serve static files from public folder
app.use(cookieParser()); //to parse cookies from request headers

//import routes

import userRouter from "./routes/user.routes.js";

app.get("/", (req, res) => {
  res.send("API is running...");
});

//routes declaration
app.use("/api/v1/users", userRouter);
//http://localhost:3000/api/v1/users/register   () when req comes of /api/v1/users it works as middleware and pass work to userRouter then userRouter go into /routes/user.routes.js then /register req comes then registerUser fn calls.)

export { app };
