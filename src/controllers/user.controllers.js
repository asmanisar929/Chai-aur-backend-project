import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrorHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
//1) get user details from frontend (if no frontend then get data from postman)
//2) validation (no empty field)
//(3) check if user already exists (check by username , email)
//(4) check for files (coverimages, check for avatar).Check multer uploaded avatar file successfuly or not .
//(5) if available files(coverimages,avatar) upload them to cloudinary.Also check avatar uploaded succesfuly or not by cloudinary.
//(6) create user object  (create entry in db). Object bcz in mongo no sql databases so made objects.
//(7) remove password and refresh token field from response (bcz in response all things present which we create)
//(8) check for user creation
//(9) return response

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken; //save refreshToken in database
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

//-------------------------------------------------------------------------------------

//(1)

const registerUser = asyncHandler(async (req, res) => {
  //express gives by default body access req.body
  const { fullname, email, username, password } = req.body; //if data comes from form or from json yeh mil jaiga req.body main. agr data url si arha usko baad main dekhain gai
  //console.log("email : ", email);

  //(2)

  /*if (fullname === "") {
  throw new ApiErrorHandler(400, "fullname is required");
}*/ // we can use this if condition but it is difficult to put condition on all fields so use below method

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //(3)

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  console.log(req.files); // show on terminal what inside files (avatar , coverImage)
  //(4)

  //multer gives by default files access req.files

  const avatarLocalPath = req.files?.avatar[0]?.path; //[0] means we use 1st property and path here multer upload files on tem local storage and give path here we get that path
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;

  if (!avatarLocalPath) {
    //not check coverImage bcz in models we sais Avatar requied coverImage not
    throw new ApiError(400, "Avatar file is required.");
  }

  if (
    //do this bcz if no cover image then erfror occurs in this (const coverImageLocalPath = req.files?.coverImage[0]?.path;) bcz in this we dont do if condition check as in avatarLocalPath .bcz coverImage not required so did if condition like this
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

  //(5)
  const avatar = await uploadOnCloudinary(avatarLocalPath); //use await bcz file uploading take time
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required.");
  }

  //(6)

  const user = await User.create({
    //put await bcz we deal with db so chance of error high ApiErrorHandler resolve them but take time so use await
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "", //it means coverImage hai to url nikaal lo or ni hai to khair hai bcz we know coverImage not necessary. we do this bcz we dont check above that coveImage available or not
    username: username.toLowerCase(),
    email,
    password,
  });

  //(7)
  const createdUser = await User.findById(user._id).select(
    //check user create in db or not if created then seelect what we remove
    "-password -refreshToken"
  );

  // (8)
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user.");
  }

  //(9)
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully")); // to return response in structured and organized manner and for this import ApiResponse from utility
});

/* -------------------- ACCESS TOKEN REFRESH TOKEN -------------------------------

 Example Flow (Step by Step)
Login:
1) User logs in with email & password.
2) Server verifies and sends Access Token (short-lived) + Refresh Token (long-lived).
3) For each API request, frontend sends access token in Authorization header.
4) After 15 minutes, the access token expires.
5) If user makes another request, they get 401 Unauthorized.
6) Frontend silently sends refresh token to /auth/refresh.
7) Backend verifies refresh token → issues new access token.
8) User doesn’t need to log in again.

Logout:
1) On logout, both tokens are deleted from storage.

✅ In simple words:
Access token = short-lived ticket to enter the cinema hall 🎟️
Refresh token = membership card that lets you get a new ticket without standing in line again.*/

const loginUser = asyncHandler(async (req, res) => {
  // (1) req body -> data
  // (2)  username or email
  // (3) find the user
  // (4) password check
  // (5) access and referesh token
  // (6) send cookie
  // (7) return response

  //------------------------------------------------------------------

  //(1)
  const { email, username, password } = req.body;
  console.log(email);

  //(2)

  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }

  // Here is an alternative of above code based on logic discussed in video:
  // if (!(username || email)) {
  //     throw new ApiError(400, "username or email is required")

  // }

  //(3)
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  //(4)

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  //(5)

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    //call fn generaterAccessAndRefreshToken
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    //optional step that not send password and refreshToken when user LoggedIn
    "-password -refreshToken"
  );

  //(6)         //accessToken And RefreshToken bhej rhay through cookies use secure cookies
  const options = {
    //options is an object which is modifiable throgh frontend but when we set httpOnly and secure true then it can modifiable only through server
    httpOnly: true,
    secure: true,
  };

  // (7)

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse( //json response
        200, //statuscode
        {
          //this object is message
          user: loggedInUser,
          accessToken,
          refreshToken, //cookies main access refresh token bhej diye yahan dobara bhej rhay kai agr user khud sai cookies save krwana chahta kisi local storage pr
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  //to logout user we make auth middleware without this we have no info about user so we unable to logged out the user
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined, //update refreshToken field
      },
    },
    {
      new: true, //return main jo response milay ga usmain updated new value milay gi
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  //clear cookies
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

//if access token expired then frontend send refreshtoken as refreshtoken present in backend then it verify refreshtoken and issue new access token
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      //jwt.verify used to get decoded information
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      //backend verify that incomingRefreshToken which frontend send matches with refreshToken whuch is saved in database
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefereshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
