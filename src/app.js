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
export { app };
