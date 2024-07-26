const { model, Schema } = require('mongoose');
 
let erfolge = new Schema({
   userID: String,
   firstMessage: Boolean,
   idee: Number //Max 10
})
 
module.exports = model('erfolge', erfolge);