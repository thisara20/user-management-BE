const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
require("dotenv").config();
const userRouter = require("./routes/User.js");


const path = require('path');

const PORT = process.env.PORT || 8070;
const URL = process.env.MONGODB_URL;

app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '../build')));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/cors', (req, res,next) => {
  res.set('Access-Control-Allow-Origin', '*'); 
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
  })

mongoose.connect(URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB connection success!");
});

app.use("/user", userRouter); //user is the url name to call Users.js file

app.listen(PORT, () => {
  console.log(`Server up and running on port ${PORT}`);
});
