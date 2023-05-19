const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); 

const userSchema = new mongoose.Schema({
  //create new object

  name: {
    type: String,
  //  required: true,
  allowNull:true,
  },

  email: {
    type: String,
   // required: true,
   allowNull:true,
  },

  password: {
    type: String,
   // required: true,
   allowNull:true,
  },

  picture:{
    type: String,
    allowNull:true,

  },

});

userSchema.pre("save", function (next) {
  var user = this;

  bcrypt
    .hash(user.password, 10)
    .then((hash) => {
      user.password = hash;
      next();
    })
    .catch((e) => {
      next(e);
      console.log(`Error in encrypting password: ${e.message}`);
    });
});

userSchema.methods.passwordComparison = function (inputPassword) {
  var user = this;
  return bcrypt.compare(inputPassword, user.password);
};

const User = mongoose.model("user", userSchema);
module.exports = User;
