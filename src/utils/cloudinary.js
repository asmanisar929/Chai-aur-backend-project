// Upload file (pdf,image,video) this work done in backend. there are 2 steps :
// (1)we take file from user and put it on local server temporarily through multer.
//(2) By using cloudinary we take file from local storage and upload it on our server.
//(we have an option that instead of doing 2 steps just take file from user by multer and upload it on server through cloudinary.but we follow 2 steps in production grade so we have an option to re upload file.)
import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; //file system

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  //file is coming from multer
  try {
    if (!localFilePath) {
      return null;
    }
    //upload file on cloudinary
    const response = await cloudinary.uploader.upload(
      localFilePath,
      { resource_type: "auto" } //it detect the file type automatically
    );
    //file uploaded successfully
    //console.log("file uploaded on cloudinary", response.url);
    fs.unlinkSync(localFilePath); //after file upload successfully delete the file from local temporary storage ie (/public/temp)
    return response;
  } catch (err) {
    fs.unlinkSync(localFilePath); //delete the locally saved temporary file as the upload operation got failed
    return null;
  }
};

export { uploadOnCloudinary };

/*cloudinary.v2.uploader.upload(
  "CLOUDINARY_URL=cloudinary://<your_api_key>:<your_api_secret>@chaiaurcode-asma",
  {
    public_id: "sample_id",
  },
  function (error, result) {
    console.log(result, error);
  }
);*/
