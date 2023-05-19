const router = require("express").Router();
let User = require("../models/User");
const { userService } = require("../services");
require("dotenv").config();

const { OAuth2Client } = require("google-auth-library");
//signup
router.post("/signup", async (req, res) => {
  console.log("signup");
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  try {
    await userService.signup(name, email, password);
    res.status(201).send({ success: true, message: "user saved successfully" });
  } catch (error) {
    res.status(500).send({ success: false, message: "signup error" });
  }
});

//login
router.post("/login", async (req, res) => {
  console.log("login");
  const key = process.env.SECURITY_KEY;
  const email = req.body.email;
  const password = req.body.password;

  try {
    let token = await userService.login(key, email, password);
    if (token) {
      return res
        .status(200)
        .send({ success: true, message: "success", user: token });
    }
  } catch (error) {
    return res.status(401).send({ success: false, message: "No user found" });
  }
});

//JWT authentication

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const key = process.env.SECURITY_KEY;
  const user = req.user;
  try {
    await userService.verifyToken(authHeader, key, user);
    next();
  } catch (error) {
    return res.status(401).send({ success: false, error: "Invalid Token" });
  }
};

//view all the users
router.get("/", verifyToken, async (req, res) => {
  try {
    let response = await userService.readUsers();
    if (response) {
      return res
        .status(200)
        .send({ success: true, message: "success", data: response });
    }
  } catch (error) {
    return res
      .status(500)
      .send({ success: false, error: "Error while loading data" });
  }
});

//fetch data of one user
router.get("/find", verifyToken, async (req, res) => {
  const userEmail = req.body.email;

  try {
    let structuredData = await userService.readUser(userEmail);
    if (structuredData) {
      return res.status(200).send({
        success: true,
        message: "User fetched successfully",
        data: structuredData,
      });
    }
  } catch (error) {
    return res
      .status(500)
      .send({ success: false, error: "Error while loading data" });
  }
});

//sso

router.post("/auth/google/callback", async (req, res) => {
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  
  const key = process.env.SECURITY_KEY;
  //google id token as authId
  const { authId } = req.body; 

   
    //check if passed token is valid
    const ticket = await client.verifyIdToken({
      idToken: authId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    //get metadata from the id token, to be saved in the db
    const { name, email, picture } = ticket.getPayload();
    console.log("email",email); 
    
    try{

      let token = await userService.googleLogin(key,name, email, picture);
      console.log("token1",token);
 
     if (token) {
      console.log("found");
        return res.status(200).send({ success: true, message: "success", user: token });
       
     } else {
        console.log("not found");
        return res.status(401).send({ success: false, message: "No user found" });

     }
    } catch (e) {
      res.status(500).send({
        error: e,
      });
    }
    

    //upsert is true, this option enables mongoose to create a new entry if there is no existing record matching the filter
  
});

//authenticateUser is the middleware where we check if the use is valid/loggedin
 

module.exports = router;
