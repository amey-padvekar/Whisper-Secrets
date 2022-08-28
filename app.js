//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser  = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
const encrypt = require("mongoose-encryption");
// const md5 = require("md5")
// const bcrypt = require("bcrypt");
const session = require("express-session");// level 4
const passport = require("passport");// level 4
const passportLocalMongoose = require("passport-local-mongoose"); // level 4
const GoogleStrategy = require("passport-google-oauth20").Strategy; //Level 6
const findOrCreate = require("mongoose-findorcreate"); //Level 6

const app = express();
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"));
app.set("view engine", "ejs");

// const saltRounds = 10;

app.use(session({
    secret: "Pineapple is ok on pizza.",
    resave: false,
    saveUninitialized: false,
    

}));

app.use(passport.initialize());// level 4
app.use(passport.session());// level 4

mongoose.connect("mongodb://127.0.0.1:27017/userDB").then(function(err){
    console.log("connection successful")
})

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String //Level 6
})
// Level 2 Authentication
// userSchema.plugin(encrypt, {secret:process.env.SECRET, excludeFromEncryption: ["email"]})
userSchema.plugin(passportLocalMongoose);// level 4
userSchema.plugin(findOrCreate);//Level 6

const User = new mongoose.model("User",userSchema);

passport.use(User.createStrategy());// level 4

// passport.serializeUser(User.serializeUser());// level 4
// passport.deserializeUser(User.deserializeUser());// level 4

passport.serializeUser(function(user, done) {//Level 6
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {//Level 6
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

passport.use(new GoogleStrategy({//Level 6
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/", function(req,res){
    res.render("home");
})

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));//Level 6

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),//Level 6
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

app.get("/login", function(req,res){
    res.render("login");
})


app.get("/register", function(req,res){
    res.render("register");
})

app.get("/secrets", function(req,res){
    // level 4
    if(req.isAuthenticated()){
        res.render("secrets");
    }
    else{
        res.redirect("/login")
    }
})

app.get("/logout", function(req,res){
    // level 4
    req.logout(function(err){
        console.log(err);
    });
    res.redirect("/")
})

app.post("/register", function(req,res){
    // level 4
    User.register({username:req.body.username}, req.body.password, function(err,user){
        if(!err){
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            })          
        }
        else{
            console.log(err)
            res.redirect("/register")
        }
    })
    
})

app.post("/login", function(req,res){
    // level 4
    const user = new User({
        username : req.body.username,
        password : req.body.password
    });
    req.login(user , function(err){
        if(!err){
            passport.authenticate("local")(req,res, function(){
                res.redirect("/secrets")
            })
        }
        else{
             console.log(err);
        }
    })
})



app.listen(3000, function(req,res){
    console.log("The server is listening to port 3000.")
})