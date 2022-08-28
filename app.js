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

const app = express();
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"));
app.set("view engine", "ejs");

// const saltRounds = 10;

app.use(session({
    secret: "Pineapple is ok on pizza.",
    resave: false,
    saveUninitialized: false

}));

app.use(passport.initialize());// level 4
app.use(passport.session());// level 4

mongoose.connect("mongodb://127.0.0.1:27017/userDB").then(function(err){
    console.log("connection successful")
})

const userSchema = new mongoose.Schema({
    email: String,
    password: String
})
// Level 2 Authentication
// userSchema.plugin(encrypt, {secret:process.env.SECRET, excludeFromEncryption: ["email"]})
userSchema.plugin(passportLocalMongoose);// level 4

const User = new mongoose.model("User",userSchema);

passport.use(User.createStrategy());// level 4

passport.serializeUser(User.serializeUser());// level 4
passport.deserializeUser(User.deserializeUser());// level 4


app.get("/", function(req,res){
    res.render("home");
})


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