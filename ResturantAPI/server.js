//calling all the moduls that will be used
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const fs = require("fs");
const session = require("express-session");
const ObjectId = require("mongodb").ObjectID;
const MongoDBStore = require("connect-mongodb-session")(session);
const User = require("./userModel.js");
const Order = require("./orderModel.js");

let store = new MongoDBStore({
  uri: "mongodb://localhost:27017/a4",
  collection: "sessions",
});

//creating the sessions
app.use(
  session({
    store: store,
    secret: "some secret key here",
    resave: true,
    saveUninitialized: false,
  })
);

//establishing the connection
mongoose.connect("mongodb://localhost/a4", { useNewUrlParser: true });
let db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
//requring
const bodyParser = require("body-parser");
const order = require("./orderModel");
const user = require("./userModel");
const { request } = require("http");
const { rawListeners } = require("process");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//calling all the moduls that will be used
app.use(express.static("public"));
app.set("views");
app.set("view engine", "pug");
app.use(express.json());

//This is rendering the index pug which shows the welcome page
app.route("/", "/index").get((req, res) => {
  res.render("index", { checkOBJ: req.session });
});
//logging the user out and setting thier loggin state to false meaning thier logout and should change the header
app.route("/logout").get((req, res) => {
  req.session.loggedIn = false;
  res.render("index", { checkOBJ: req.session });
});
//render the login for the user to allow them to login
app.route("/login").get((req, res) => {
  res.render("login", { checkOBJ: req.session });
});
//this route allows the user to acces thier profile and edit it
app.route("/profile").get((req, res) => {
  res.redirect("/users/" + req.session.userId);
});
//this is a post request that allows the user to edit thier profile and save to the database
app.route("/users/:userID").post((req, res) => {
  //requring the users id form the url and giving it a variable
  let usersID = new ObjectId(req.params.userID);
  //loading the data to manipulate
  User.findOne({ _id: usersID }, function (err, profileName) {
    if (profileName._id.toString() == req.session.userId) {
      if (req.body.drone == "private") {
        profileName.privacy = true;
      } else {
        profileName.privacy = false;
      }
      //saving the newly edited object
      profileName.save(function (err, profileName) {});
    }
  });
});
//route should provide the web page for the user to register
app.route("/registration").get((req, res) => {
  res.render("registration", { checkOBJ: req.session });
});
//checking if the user is already logged in
app.route("/checkLogin").post((req, res) => {
  if (req.session) {
    if (req.session.loggedIn) {
      res.send("Already Logiined in");
      return;
    }
  }
  //finding and setting the users login into true
  User.findOne(
    { username: req.body.username, password: req.body.password },
    function (err, profileName) {
      if (profileName != null) {
        req.session.loggedIn = true;
        req.session.userId = profileName._id.toString();

        res.redirect("/");
      } else {
        res.sendStatus(400);
      }
    }
  );
});
//registration request post this allwows us to update and add a user
app.route("/registration").post((req, res) => {
  //finding a user
  User.findOne({ username: req.body.username }, function (err, profileName) {
    //if that user dose not have a profile then you can procced
    if (profileName == null) {
      //inserting adding the newly created object of the profile
      user.insertMany(
        {
          username: req.body.username,
          password: req.body.password,
          privacy: false,
        },
        function (err, newUser) {
          //if err meaning invalid input clear the registration page and display error message
          if (err != null) {
            res.render("registration", { errormessage: "Invalid Input" });
          } else {
            req.session.loggedIn = true;
            //redirecting the the users page
            res.redirect("/users/" + newUser[0]._id.toString());
          }
        }
      );
    } else {
      res.render("registration", { errormessage: "Invalid Input" });
    }
  });
});
//this route allows us to query the username and filter only the private users show
app.route("/users").get((req, res) => {
  let filter = { privacy: false };
  if (req.query.name) {
    filter = { username: req.query.name, ...filter };
  }
  //finding a user and also filtering it to be only private users
  User.find(filter, function (err, users) {
    //console.log(users[0].privacy);
    res.render("users", { users: users, checkOBJ: req.session });
  });
});
//route for get a specific user and display thier information
app.route("/users/:userID").get((req, res) => {
  let usersID = new ObjectId(req.params.userID);
  //finding a user
  User.findOne({ _id: usersID }, function (err, profileName) {
    if (
      profileName.privacy &&
      profileName._id.toString() !== req.session.userId
    ) {
      res.sendStatus(403);
    } else if (
      profileName.privacy == false ||
      profileName._id.toString() == req.session.userId
    ) {
      //rendering the user
      res.render("user", { profile: profileName, checkOBJ: req.session });
    } else {
      res.sendStatus(404);
    }
  });
});
//route to recive the orders and display them using thier unique id given by mongoos
app.route("/orders/:thatOrdersID").get((req, res) => {
  let usersID = new ObjectId(req.session.userId);
  let orderID = new ObjectId(req.params.thatOrdersID);
  //finding the user
  User.findOne({ _id: usersID }, function (err, profileName) {
    //making sure there public and or logined in
    if (
      profileName.privacy &&
      profileName._id.toString() !== req.session.userID
    ) {
      res.sendStatus(403);
    } else if (
      profileName.privacy == false ||
      profileName._id.toString() == req.session.userId
    ) {
      db.collection("orders").findOne({ _id: orderID }, function (err, order) {
        if (err) {
          res.sendStatus(404);
        }

        let orderArray = [];

        for (let i = 0; i < Object.values(order.order).length; i++) {
          orderArray.push(Object.values(order.order)[i]);
        }
        //passing all important infomration to the pug
        res.render("order", {
          profile: profileName,
          order: order,
          checkOBJ: req.session,
          orders: orderArray,
        });
      });
    } else {
      res.sendStatus(404);
    }
  });
});
//route to get and render our order form for the users
app.route("/orderform").get((req, res) => {
  res.render("orderform", { checkOBJ: req.session });
});
//this route is responable for for updaing the order schema and adding the new information to the data base
app.route("/orders").post((req, res) => {
  //saving the user id
  req.body.user = req.session.userId;
  const order = new Order(req.body);
  order.save(function (err, newOrder) {
    if (err) throw err;
    // saved!
  });
  //creating the new order
  Order.create(req.body, function (err, order) {
    if (err == null) {
      //updaitg the user with the new information
      User.findOneAndUpdate(
        { _id: req.session.userId },
        { $push: { orders: order } },
        function (err, userOrder) {
          res.status(200).send(userOrder.orders);
        }
      );
    } else {
      res.sendStatus(424);
    }
  });
});

db.once("open", function () {
  app.listen(3000);
  console.log("Server running at http://localhost:3000");
});
