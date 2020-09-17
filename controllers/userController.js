const bcrypt = require("bcryptjs");
const db = require("../models");
const User = db.User;
const Restaurant = db.Restaurant
const Comment = db.Comment
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship
const imgur = require('imgur-node-api');
const IMGUR_CLIENT_ID = process.env.IMGUR_ID;

const userController = {
    addFollowing: (req, res) => {
        return Followship.create({
            followerId: req.user.id,
            followingId: req.params.userId
        })
        .then(() => {
            return res.redirect('back')
        })
    }, 
    removeFollowing: (req, res) => {
        return Followship.findOne({where: {
            followerId: req.user.id,
            followingId: req.params.userId
        }})
        .then((followship) => {
            followship.destroy()
            .then(() => {
                return res.redirect('back')
            })
        })
    },
    getTopUser: (req, res) => {
        return User.findAll({
            include: [
                { model: User, as: 'Followers' }
            ]
        }).then(users => {
            users = users.map(user => ({
                ...user.dataValues,
                FollowerCount: user.Followers.length,
                isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
            }))
            users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
            return res.render('topUser', { users: users })
        })
    },
    addFavorite: (req, res) => {
        return Favorite.create({
            UserId: req.user.id,
            RestaurantId: req.params.restaurantId
        })
        .then(() => {
            return res.redirect('back')
        })
    },       
    removeFavorite: (req, res) => {
        return Favorite.findOne({where: {
            UserId: req.user.id,
            RestaurantId: req.params.restaurantId
        }})
        .then((favorite) => {
            favorite.destroy()
            .then(() => {
                return res.redirect('back')
            })
        })
    },
    addLike: (req, res)=>{
        return Like.create({
            UserId: req.user.id,
            RestaurantId: req.params.restaurantId
        })
        .then(() => {
            return res.redirect('back')
        })
    },
    removeLike: (req, res)=>{
        return Like.findOne({where: {
            UserId: req.user.id,
            RestaurantId: req.params.restaurantId
        }})
        .then((like) => {
            like.destroy()
            .then(() => {
                return res.redirect('back')
            })
        })
    },
    getUser: (req, res)=>{
        User.findByPk(req.params.id, {
            include: [
                { model: Comment, include: [Restaurant] },
                { model: Restaurant, as: 'FavoritedRestaurants' },
                { model: User, as: "Followings" },
                { model: User, as: "Followers" }
            ]
        })
        .then(userData=>{            
            let favoritedRestaurantsNum = userData.toJSON().FavoritedRestaurants.length;
            let followingsNum = userData.toJSON().Followings.length;
            let followersNum = userData.toJSON().Followers.length;
            let tempId = [];
            let comments = [];
            userData.toJSON().Comments.forEach(comment=>{
                if(!tempId.includes(comment.Restaurant.id)){
                    tempId.push(comment.Restaurant.id);
                    comments.push(comment);
                }
            })
            let commentsNum = comments.length;
            res.render("users/user", { userData: userData.toJSON(), comments, commentsNum, favoritedRestaurantsNum, followingsNum, followersNum });
        })
    },
    editUser: (req, res)=>{
        User.findByPk(req.params.id)
        .then(userData=>{
            if(req.user.id !== userData.id){
                return res.redirect("back");
            }
            res.render("users/edit", { userData: userData.toJSON() });
        })
    },
    putUser: (req, res)=>{
        if(req.user.id !== parseInt(req.params.id)){
            return res.redirect("back");
        }
        if(!req.body.name){
            req.flash("error_msg", "請輸入名字");
            return res.redirect("back");
        }
        let { file } = req;
        if (file) {
            imgur.setClientID(IMGUR_CLIENT_ID);
            imgur.upload(file.path, (err, img) => {
                return User.findByPk(req.params.id)
                        .then(user => {
                            user.update({
                                name: req.body.name,
                                image: img.data.link,
                            }).then(() => {
                                req.flash('success_msg', '編輯成功')
                                res.redirect(`/users/${user.id}`)
                            })
                        })
          })
        } else {
          return User.findByPk(req.params.id)
                    .then(user => {
                        user.update({
                            name: req.body.name,
                            image: user.image
                        }).then(() => {
                            req.flash('success_msg', '編輯成功')
                            res.redirect(`/users/${user.id}`)
                        })
                    })
        }
    },
    signUpPage: (req, res)=> {
        res.render("users/signup");
    },
    signUp: (req, res) => {
        let {name, email, password, passwordCheck} = req.body;
        if(password !== passwordCheck){
            req.flash("error_msg", "密碼確認錯誤");
            return res.redirect("/signup");
        }else{
            User.findOne({
                where: {
                    email
                }
            })
            .then(user=>{
                if(user){
                    req.flash("error_msg", "此信箱已註冊過");
                    res.redirect("/signup");
                }else{
                    User.create({
                        name,
                        email,
                        password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
                    })
                    .then(user=>{
                        req.flash("success_msg", "註冊成功");
                        return res.redirect('/signin');
                    })
                }
            })
        }
    },
    signInPage: (req, res)=>{
        return res.render("users/signin");
    },
    signIn: (req, res)=>{
        req.flash("success_msg", "登入成功");
        res.redirect("/restaurants");
    },
    logout: (req, res)=>{
        req.flash("success_msg", "登出成功");
        req.logout();
        res.redirect("/signin");
    }
}
module.exports = userController;