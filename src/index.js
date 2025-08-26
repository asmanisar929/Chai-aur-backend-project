import mongoose from "mongoose";
import express from "express";
import { DB_NAME } from "./constants.js";
import { app } from "./app.js";
import connectDB from "./db/index.js";
//require("dotenv").config({ path: "./.env" });    //either use required or below import ur choice
import dotenv from "dotenv"; //after this also do changings in package.joson in scripts

dotenv.config({ path: "./.env" });
connectDB()
  .then(() => {
    app.on("error", (err) => {
      console.error("Express error:", err);
      throw err;
    });

    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGODB connection failed !!!", err);
  });
// **** first methof of connecting database ****

/*(async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
    app.on("error", (err) => {
      console.error("Express error:", err);
      throw err;
    });

    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
})();*/
