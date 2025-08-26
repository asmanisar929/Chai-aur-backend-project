import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrorHandler } from "../utils/ApiErrorHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils.cloudinary.js";
import { ApiResponse } from "../utils.ApiResponse.js";
//1) get user details from frontend (if no frontend then get data from postman)
//2) validation (no empty field)
//(3) check if user already exists (check by username , email)
//(4) check for files (coverimages, check for avatar).Check multer uploaded avatar file successfuly or not .
//(5) if available files(coverimages,avatar) upload them to cloudinary.Also check avatar uploaded succesfuly or not by cloudinary.
//(6) create user object  (create entry in db). Object bcz in mongo no sql databases so made objects.
//(7) remove password and refresh token field from response (bcz in response all things present which we create)
//(8) check for user creation
//(9) return response

//-------------------------------------------------------------------------------------

//(1)

const registerUser = asyncHandler(async (req, res) => {
  //express gives by default body access req.body
  const { fullname, email, username, password } = req.body; //if data comes from form or from json yeh mil jaiga req.body main. agr data url si arha usko baad main dekhain gai
  console.log("email : ", email);

  //(2)

  /*if (fullname === "") {
  throw new ApiErrorHandler(400, "fullname is required");
}*/ // we can use this if condition but it is difficult to put condition on all fields so use below method

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiErrorHandler(400, "All fields are required");
  }

  //(3)

  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiErrorHandler(
      409,
      "User with email or username already exists"
    );
  }

  //(4)

  //multer gives by default files access req.files

  const avatarLocalPath = req.files?.avatar[0]?.path; //[0] means we use 1st property and path here multer upload files on tem local storage and give path here we get that path
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    //not check coverImage bcz in models we sais Avatar requied coverImage not
    throw new ApiErrorHandler(400, "Avatar file is required.");
  }

  //(5)
  const avatar = await uploadOnCloudinary(avatarLocalPath); //use await bcz file uploading take time
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiErrorHandler(400, "Avatar file is required.");
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
  const createdUser = User.findById(user._id).select(
    //check user create in db or not if created then seelect what we remove
    "-password -refreshToken"
  );

  // (8)
  if (!createdUser) {
    throw new ApiErrorHandler(
      500,
      "Something went wrong while registering the user."
    );
  }

  //(9)
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully")); // to return response in structured and organized manner and for this import ApiResponse from utility
});

export { registerUser };
