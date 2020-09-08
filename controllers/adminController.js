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
    getRestaurant: (req, res) => {
        return Restaurant.findByPk(req.params.id, {
                    raw: true
                })
                .then(restaurant=>{
                    return res.render('admin/restaurant', { restaurant })
                })
    },
    editRestaurant: (req, res) => {
        return Restaurant.findByPk(req.params.id, { raw: true })
                .then(restaurant=>{
                    return res.render("admin/create", { restaurant });              
                })
    },
    putRestaurant: (req, res)=>{
        let { name, tel, address, opening_hours, description } = req.body;
        if(!name){
            req.flash("error_msg", "請輸入店名");
            return res.redirect("back");
        }
        return Restaurant.findByPk(req.params.id)
                .then(restaurant=>{
                    restaurant.update({
                        name, tel, address, opening_hours, description    
                    })
                    .then(restaurant=>{
                        req.flash("success_msg", "餐廳編輯成功");  
                        res.redirect("/admin/restaurants");
                    })
                })
    },
    createRestaurant: (req, res) => {
        let restaurant = "";
        return res.render('admin/create', { restaurant })
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
    },
    deleteRestaurant: (req, res) => {
        return Restaurant.findByPk(req.params.id)
                .then(restaurant=>{
                    restaurant.destroy()
                    .then(()=>{
                        req.flash("success_msg", "刪除成功");
                        res.redirect("/admin/restaurants");
                    })
                })
    }
}

module.exports = adminController;