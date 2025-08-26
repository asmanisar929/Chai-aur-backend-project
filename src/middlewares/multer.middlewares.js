import multer from "multer";

const storage = multer.diskStorage({
  //we use disk stoga not memory storage to save file
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage,
});
