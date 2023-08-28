const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//schema used for the user which will hold the relvent data
let userSchema = Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  privacy:{
    type: Boolean,
    required: true,
  },
  orders: [{type: Schema.Types.ObjectId

  }],
   
});

module.exports= mongoose.model("User",userSchema)
