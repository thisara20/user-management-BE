let User = require("../models/User");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");  

const signup = async (name, email, password) => {
  const isExistingUser = await User.findOne({ email: email }); //check whether a unique email address
  if (isExistingUser) {
    throw new Error("email already exist");
  }
  const newUser = new User({
    //create an object from User model
    name,
    email,
    password,
  });
  await newUser.save();
};

const login = async (key, email, password) => {
  const isExistingUser = await User.findOne({ email: email });

  if (isExistingUser) {
    if (await bcrypt.compare(password, isExistingUser.password)) {
      const token = jwt.sign(
        {
          email: email,
        },
        key,
        { expiresIn: "1h" }
      );
      return token;
    }
  } else throw new Error("Unauthorized user");
};

const verifyToken = async (authHeader, key, user) => {
  const token = await authHeader.split(" ")[1] ;
  if (token) {
    const decoded = jwt.verify(token, key);
    user = decoded;
  } else throw new Error("A token is required for authentication");
};

const readUsers = async () => {
  const allUser = await User.find();
  if (allUser) {
    const structuredData = [];

    //for of loop
    for (const element of allUser) {
      structuredData.push({
        name: element.name,
        email: element.email,
      });
    }
    return structuredData;
  } else throw new Error("Error while fetching data");
};

const readUser = async (userEmail) => {
  const structuredData = [];
  const user = await User.findOne({ email: userEmail });

  if (user) {
    structuredData.push({
      name: user.name,
    });
    return structuredData;
  } else throw new Error("Error while fetching user data");
};
 
const googleLogin = async (key,name,email,picture) => { 
  const isExistingUser = await User.findOne({ email: email });

  if (isExistingUser) { 
      const token = jwt.sign(
        {
          email: email,
        },
        key,
        { expiresIn: "1h" }
      ); 
      return token;
  }  else {
    const newUser = await User.findOneAndUpdate(
      {
        email,
      },
      
      {
        name,
        picture,
      },
      {
        upsert: true,
      }
    );
    if (newUser) {
      const token = jwt.sign(
        {
          email: email,
        },
        key,
        { expiresIn: "1h" }
      );
      return token;
  }else throw new Error("Error while generating user token");
  } 
};
 

module.exports = { signup, login, verifyToken, readUsers, readUser,googleLogin};
