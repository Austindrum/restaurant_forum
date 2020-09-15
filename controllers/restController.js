const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const User = db.User
const Comment = db.Comment
const pageLimit = 10
const moment = require("moment");

const restController = {
    getRestaurants: (req, res)=>{
        let offset = 0
        let whereQuery = {}
        let categoryId = ''
        let onHomePage = true
        if(req.query.page) offset = (req.query.page - 1) * pageLimit
        if(req.query.categoryId){
          categoryId = Number(req.query.categoryId)
          whereQuery['CategoryId'] = categoryId
        }
        Restaurant.findAndCountAll({ 
            include: Category, 
            where: whereQuery,
            offset,
            limit: pageLimit
        })
        .then(result=>{
            let page = Number(req.query.page) || 1
            let pages = Math.ceil(result.count / pageLimit)
            let totalPage = Array.from({ length: pages }).map((item, index)=> index + 1);
            let prev = page - 1 < 1 ? 1 : page - 1
            let next = page + 1 > pages ? pages : page + 1
            let data = result.rows.map(r=>({
                ...r.dataValues,
                description: r.dataValues.description.substring(0, 50),
                categoryName: r.Category.name
            }))
            Category.findAll({ raw: true, nest: true })
            .then(categories=>{
                return res.render("restaurants", { 
                    restaurants: data, 
                    categories, 
                    categoryId,
                    page,
                    totalPage,
                    prev,
                    next,
                    onHomePage
                });
            })
        })
    },
    getRestaurant: (req, res) => {
        return Restaurant.findByPk(req.params.id, {
                   include:  [
                       Category,
                       { model: Comment, include: [User] }
                    ]
                }).then(restaurant => {
                    restaurant.increment('viewCount');
                    let data = restaurant.toJSON();
                    data.Comments.forEach(comment=>{
                        comment.createdAt = moment(comment.createdAt).fromNow();
                    })
                    console.log(data);
                    return res.render('restaurant', { data })
                })
    },
    getFeeds: (req, res) => {
        return Restaurant.findAll({
            limit: 10,
            raw: true,
            nest: true,
            order: [['createdAt', 'DESC']],
            include: [Category]
        }).then(restaurants => {
            Comment.findAll({
                limit: 10,
                raw: true,
                nest: true,
                order: [['createdAt', 'DESC']],
                include: [User, Restaurant]
            }).then(comments => {
                let restaurantsData = restaurants;
                let commentsData = comments;
                restaurantsData.forEach(restaurant=>{
                    restaurant.createdAt = moment(restaurant.createdAt).fromNow();
                })
                commentsData.forEach(comment=>{
                    comment.createdAt = moment(comment.createdAt).fromNow();
                })
                return res.render('feeds', {
                    restaurantsData,
                    commentsData
                })
            })
        })
    },
    getRestaurantDashbord: (req, res)=>{
        return Restaurant.findByPk(req.params.id, {
                    include: [
                        Category,
                        { model: Comment, include: [User] }
                    ]
                }).then(restaurant=>{
                    res.render("restaurantDashbord", { restaurant: restaurant.toJSON() });
                })
    }
}

module.exports = restController;