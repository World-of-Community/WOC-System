import { model, Schema } from "mongoose";

const erfolge = new Schema({
  userID: String,
  firstMessage: Boolean,
  idee: {
    type: Number,
    default: 0,
    max: 10,
  },
});

export default model("erfolge", erfolge);
