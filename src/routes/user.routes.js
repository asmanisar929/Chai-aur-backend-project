import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

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

router.route("/login").post(loginUser);

//secure routes
router.route("/logout").post(verifyJWT, logoutUser); //verifyJWT is middleware
router.route("/refresh-token").post(refreshAccessToken);

export default router;
