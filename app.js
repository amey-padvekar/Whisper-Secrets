//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser  = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
const encrypt = require("mongoose-encryption");
const md5 = require("md5")
const bcrypt = require("bcrypt");

const app = express();
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"));
app.set("view engine", "ejs");

const saltRounds = 10;

mongoose.connect("mongodb://127.0.0.1:27017/userDB").then(function(err){
    console.log("connection successful")
})

const userSchema = new mongoose.Schema({
    email: String,
    password: String
})
// Level 2 Authentication
// userSchema.plugin(encrypt, {secret:process.env.SECRET, excludeFromEncryption: ["email"]})

const User = new mongoose.model("User",userSchema);

app.get("/", function(req,res){
    res.render("home");
})


app.get("/login", function(req,res){
    res.render("login");
})


app.get("/register", function(req,res){
    res.render("register");
})

app.post("/register", function(req,res){

     bcrypt.hash(req.body.password,saltRounds, function(err,hash){
        const newUser = new User({
            email: req.body.username,
            password: hash
        })
        newUser.save(function(err){
            if(!err){
                res.render("secrets")
            }
        });
     })
    
})

app.post("/login", function(req,res){
    User.findOne({email:req.body.username},function(err, foundUser){
        if(!err){
            bcrypt.compare(req.body.password, foundUser.password, function(err, result){
                if(!err){
                    res.render("secrets")
                }
                else{
                    console.log(err);
                }
            })
            
        }
    })
})


app.listen(3000, function(req,res){
    console.log("The server is listening to port 3000.")
})