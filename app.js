const express = require("express");
const app = express();
const db = require("./models");
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.use(session({
    secret: 'some',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

app.use((req, res, next)=>{
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    next();
})


require("./routes")(app);
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
    console.log(`Server Start On Port ${PORT}`);
})