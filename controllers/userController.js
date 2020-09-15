const bcrypt = require("bcryptjs");
const db = require("../models");
const User = db.User;
const Restaurant = db.Restaurant
const Comment = db.Comment
const imgur = require('imgur-node-api');
const IMGUR_CLIENT_ID = process.env.IMGUR_ID;

const userController = {
    getUser: (req, res)=>{
        User.findByPk(req.params.id, {
            include: [
                { model: Comment, include: [Restaurant] }
            ]
        })
        .then(userData=>{
            let commentsNum = userData.toJSON().Comments.length;
            res.render("users/user", { userData: userData.toJSON(), commentsNum });
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