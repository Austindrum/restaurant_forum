const db = require("../models");
const Restaurant = db.Restaurant;

const adminController = {
    getRestaurants: (req, res)=>{
        Restaurant.findAll({
            raw: true
        })
        .then(restaurants=>{
            return res.render("admin/restaurants", { restaurants });
        })
    },
    createRestaurant: (req, res) => {
        return res.render('admin/create')
    },
    postRestaurant: (req, res) => {
        let { name, tel, address, opening_hours, description } = req.body;
        if(!name){
            req.flash("error_msg", "請輸入店名");
            return res.redirect("/admin/restaurants/create");
        }
        return Restaurant.create({
                    name, tel, address, opening_hours, description
                })
                .then(restaurant => {
                    req.flash("success_msg", "餐廳建立成功");  
                    res.redirect("/admin/restaurants");
                })
    }
}

module.exports = adminController;