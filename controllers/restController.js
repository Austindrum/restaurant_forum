const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const User = db.User
const Comment = db.Comment
const Favorite = db.Favorite
const pageLimit = 10
const moment = require("moment");

const restController = {
    getRestaurants: (req, res)=>{
        let offset = 0
        let whereQuery = {}
        let categoryId = ''
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
                categoryName: r.Category.name,
                isFavorited: req.user.FavoritedRestaurants.length > 0 ? req.user.FavoritedRestaurants.map(f => f.id).includes(r.id) : false,
                isLike: req.user.LikeRestaurants.length > 0 ? req.user.LikeRestaurants.map(l => l.id).includes(r.id) : false
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
                });
            })
        })
    },
    getRestaurant: (req, res) => {
        return Restaurant.findByPk(req.params.id, {
                   include:  [
                       Category,
                       { model: Comment, include: [User] },
                       { model: User, as: 'FavoritedUsers' },
                       { model: User, as: 'LikeUsers' }
                    ]
                }).then(restaurant => {
                    restaurant.increment('viewCount');
                    const isFavorited = restaurant.FavoritedUsers.map(f=>f.id).includes(req.user.id);
                    const isLike = restaurant.LikeUsers.map(f=>f.id).includes(req.user.id);
                    let data = restaurant.toJSON();
                    data.Comments.forEach(comment=>{
                        comment.createdAt = moment(comment.createdAt).fromNow();
                    })
                    return res.render('restaurant', { data, isFavorited, isLike })
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
                    Favorite.findAll({
                        raw: true,
                        nest: true,
                        where: {
                            RestaurantId: restaurant.id
                        }
                    }).then(f=>{
                        res.render("restaurantDashbord", { restaurant: restaurant.toJSON(), favorites: f.length});
                    })
                })
    }
}

module.exports = restController;