const db = require("../models");
const Restaurant = db.Restaurant;
const Category = db.Category;
const Users = db.User;
const fs = require("fs");
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_ID;

const adminController = {
    getRestaurants: (req, res)=>{
        Restaurant.findAll({
            raw: true,
            nest: true,
            include: [Category]
        })
        .then(restaurants=>{
            let category = null;
            return res.render("admin/restaurants", { restaurants, category });
        })
    },
    getRestaurant: (req, res) => {
        return Restaurant.findByPk(req.params.id, {
                    // raw: true,
                    include: [Category]
                })
                .then(restaurant=>{
                    // console.log(restaurant.toJSON());
                    return res.render('admin/restaurant', { restaurant: restaurant.toJSON() })
                })
    },
    editRestaurant: (req, res) => {
        return Restaurant.findByPk(req.params.id, { raw: true })
                .then(restaurant=>{
                    Category.findAll({raw: true})
                    .then(categories=>{
                        return res.render("admin/create", { restaurant, categories });
                    })
                })
    },
    putRestaurant: (req, res)=>{
        let { name, tel, address, opening_hours, description, categoryId } = req.body;
        let { file } = req
        if(!name){
            req.flash("error_msg", "請輸入店名");
            return res.redirect("back");
        }
        if (file) {
            imgur.setClientID(IMGUR_CLIENT_ID);
            imgur.upload(file.path, (err, img) => {
                return Restaurant.findByPk(req.params.id)
                        .then((restaurant) => {
                            restaurant.update({
                                name, tel, address, opening_hours, description,
                                image: file ? img.data.link : restaurant.image,
                                CategoryId: categoryId
                            }).then((restaurant) => {
                                req.flash('success_msg', '餐廳編輯成功')
                                res.redirect('/admin/restaurants')
                            })
                        })
          })
        } else {
          return Restaurant.findByPk(req.params.id)
                    .then((restaurant) => {
                        restaurant.update({
                            name, tel, address, opening_hours, description,
                            CategoryId: categoryId,
                            image: restaurant.image
                        }).then((restaurant) => {
                            req.flash('success_msg', '餐廳編輯成功')
                            res.redirect('/admin/restaurants')
                        })
                    })
        }
    },
    createRestaurant: (req, res) => {
        let restaurant = "";
        Category.findAll({
            raw: true,
            nest: true
        }).then(categories=>{
            return res.render('admin/create', { restaurant, categories })
        })
    },
    postRestaurant: (req, res) => {
        let { name, tel, address, opening_hours, description, categoryId } = req.body;
        let { file } = req;
        if(!name){
            req.flash("error_msg", "請輸入店名");
            return res.redirect("/admin/restaurants/create");
        }
        if(file){
            imgur.setClientID(IMGUR_CLIENT_ID);
            imgur.upload(file.path, (err, img)=>{
                return Restaurant.create({
                            name, tel, address, opening_hours, description, categoryId,
                            image: file ? img.data.link : null,
                            CategoryId: categoryId
                        })
                        .then(restaurant=>{
                            req.flash("success_msg", "餐廳建立成功");
                            res.redirect("/admin/restaurants");
                        })
            })
        }else{
            return Restaurant.create({
                        name, tel, address, opening_hours, description, categoryId,
                        image: "",
                        CategoryId: categoryId
                    })
                    .then(restaurant => {
                        req.flash("success_msg", "餐廳建立成功");  
                        res.redirect("/admin/restaurants");
                    })
        }
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
    },
    getUsers: (req, res) => {
        return Users.findAll()
                .then(users=>{
                    let category = null;
                    return res.render("admin/users", { users, category })
                })
    },
    putUsers: (req, res) => {
        return Users.findByPk(req.params.id)
                .then(user=>{
                    user.update({
                        isAdmin: !user.isAdmin
                    })
                    .then(()=>{
                        req.flash('success_msg', '使用者編輯成功')
                        res.redirect('/admin/users')
                    })
                })
    }
}

module.exports = adminController;