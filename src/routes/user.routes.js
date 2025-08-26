import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.com";

const router = Router();
router.route("/register").post(
  //want to use middliware (multer) upload files (avatar,coverImage) before register user
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
); //postman tool used to test apis
export default router;
