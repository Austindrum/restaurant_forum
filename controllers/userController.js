const bcrypt = require("bcryptjs");
const db = require("../models");
const User = db.User;

const userController = {
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
    }
}
module.exports = userController;