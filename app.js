//jshint esversion:6
require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const port = 3000;
const path = require("path");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();
console.log(process.env.SECRET);
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/static", express.static(path.join(__dirname, "public")));

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/userDB");

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled

  const userSchema = new mongoose.Schema({
    email: String,
    password: String,
  });
  userSchema.plugin(encrypt, {
    secret: process.env.SECRET,
    encryptedFields: ["password"],
  });
  const User = mongoose.model("User", userSchema);

  app.get("/", (req, res) => {
    res.render("home");
  });

  app.get("/login", (req, res) => {
    res.render("login");
  });

  app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: username }, (err, foundUser) => {
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          if (foundUser.password === password) {
            res.render("secrets");
          }
        }
      }
    });
  });

  app.get("/register", (req, res) => {
    res.render("register");
  });
  app.post("/register", (req, res) => {
    const newUser = new User({
      email: req.body.username,
      password: req.body.password,
    });
    newUser.save((err) => {
      if (err) {
        console.log(err);
      } else {
        res.render("secrets");
      }
    });
  });
}

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
