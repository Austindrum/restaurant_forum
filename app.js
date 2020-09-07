const express = require("express");
const app = express();
const db = require("./models");
const bodyParser = require("body-parser");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

require("./routes")(app);
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
    console.log(`Server Start On Port ${PORT}`);
})