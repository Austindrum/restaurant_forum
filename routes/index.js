const restController = require("../controllers/restContriller");

module.exports = app =>{
    app.get("/", (req, res) => res.redirect("/restaueants"));
    app.get("/restaueants", restController.getRestaurants);
}