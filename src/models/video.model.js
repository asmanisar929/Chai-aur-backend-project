import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = mongoose.Schema(
  {
    videoFile: {
      type: String, //cloudinary URL
      required: true,
    },

    thumnnail: {
      type: String, //cloudinary URL
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      index: true, //to create an index for faster search
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },
  },

  { timesstamp: true }
);

videoSchema.plugin(mongooseAggregatePaginate); //plugin is a hook it is a middleware
export const Video = mongoose.model("Video", videoSchema);
