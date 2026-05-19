import { model, Schema } from 'mongoose';

let erfolge = new Schema({
   userID: String,
   firstMessage: Boolean,
   idee: {
      type: Number,
      default: 0,
      max: 10
  }
})

export default model('erfolge', erfolge);
