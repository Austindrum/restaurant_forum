const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

const restController = {
    getRestaurants: (req, res)=>{
        let whereQuery = {}
        let categoryId = ''
        if(req.query.categoryId){
          categoryId = Number(req.query.categoryId)
          whereQuery['CategoryId'] = categoryId
        }
        Restaurant.findAll({ include: Category, where: whereQuery })
        .then(restaurants=>{
            let data = restaurants.map(r=>({
                ...r.dataValues,
                description: r.dataValues.description.substring(0, 50),
                categoryName: r.Category.name
            }))
            Category.findAll({ raw: true, nest: true })
            .then(categories=>{
                return res.render("restaurants", { restaurants: data, categories, categoryId });
            })
        })
    },
    getRestaurant: (req, res) => {
        return Restaurant.findByPk(req.params.id, {
                   include:  Category
                }).then(restaurant => {
                    return res.render('restaurant', { restaurant: restaurant.toJSON() })
                })
    }
}

module.exports = restController;