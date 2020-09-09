const express = require("express");
const app = express();
const db = require("./models");
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("./config/passport");
const methodOverride = require("method-override");
require("dotenv").config();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(methodOverride("_method"));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use((req, res, next)=>{
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.user = req.user;
    next();
})

require("./routes")(app, passport);
app.use('/upload', express.static(__dirname + '/upload'))
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
    console.log(`Server Start On Port ${PORT}`);
})