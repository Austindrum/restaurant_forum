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
                    next
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
                    let data = restaurant.toJSON();
                    data.Comments.forEach(comment=>{
                        comment.createdAt = moment(comment.createdAt).fromNow();
                    })
                    return res.render('restaurant', { data })
                })
    }
}

module.exports = restController;