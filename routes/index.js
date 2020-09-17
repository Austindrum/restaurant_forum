const restController = require("../controllers/restController");
const adminController = require("../controllers/adminController");
const userController = require("../controllers/userController");
const categoryController = require('../controllers/categoryController.js')
const commentController = require('../controllers/commentController.js')
const multer = require("multer");
const upload = multer({ dest: 'temp/' })


module.exports = (app, passport) =>{
    const authenticated = (req, res, next) => {
        if(req.isAuthenticated()){
            return next();
        }else{
            res.redirect("/signin");
        }
    }
    const authenticatedAdmin = (req, res, next) => {
        if(req.isAuthenticated()){
            if(req.user.isAdmin){ return next() }
            return res.redirect("/");
        }else{
            res.redirect("/signin");
        }
    }
    app.get("/admin/categories", authenticatedAdmin, categoryController.getCategories);
    app.get("/admin/categories/:id", authenticatedAdmin, categoryController.getCategories);
    app.put('/admin/categories/:id', authenticatedAdmin, categoryController.putCategory);
    app.post("/admin/categories", authenticatedAdmin, categoryController.postCategory);
    app.delete('/admin/categories/:id', authenticatedAdmin, categoryController.deleteCategory)
 
    app.get("/", authenticated, (req, res) => res.redirect("/restaurants"));
    app.get('/restaurants/feeds', authenticated, restController.getFeeds)
    app.get('/restaurants/:id', authenticated, restController.getRestaurant)
    app.get('/restaurants/:id/dashbord', authenticated, restController.getRestaurantDashbord);
    
    app.get("/restaurants", authenticated, restController.getRestaurants);
    app.get("/admin", authenticatedAdmin, (req, res) => res.redirect("/admin/restaurants"));
    app.get("/admin/restaurants/create", authenticatedAdmin, adminController.createRestaurant);
    app.get("/admin/restaurants", authenticatedAdmin, adminController.getRestaurants);
    app.get("/admin/restaurants/:id", authenticatedAdmin, adminController.getRestaurant);
    app.get("/admin/restaurants/:id/edit", authenticatedAdmin, adminController.editRestaurant);
    app.delete("/admin/restaurants/:id", authenticatedAdmin, adminController.deleteRestaurant);
    app.post("/admin/restaurants", authenticatedAdmin, upload.single('image'), adminController.postRestaurant);
    app.put("/admin/restaurants/:id", authenticatedAdmin, upload.single('image'), adminController.putRestaurant);
    app.get("/admin/users", authenticatedAdmin, adminController.getUsers);
    app.put("/admin/users/:id", authenticatedAdmin, adminController.putUsers);

    app.get('/users/top', authenticated, userController.getTopUser)

    app.post('/following/:userId', authenticated, userController.addFollowing)
    app.delete('/following/:userId', authenticated, userController.removeFollowing)

    app.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
    app.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)

    app.post('/like/:restaurantId', authenticated, userController.addLike)
    app.delete('/like/:restaurantId', authenticated, userController.removeLike)

    app.post('/comments', authenticated, commentController.postComment)
    app.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)

    app.get("/users/:id", authenticated, userController.getUser)
    app.get("/users/:id/edit", authenticated, userController.editUser)
    app.put("/users/:id", authenticated, upload.single('image'), userController.putUser)

    app.get("/signup", userController.signUpPage);
    app.post("/signup", userController.signUp);
    app.get("/signin", userController.signInPage);
    app.post("/signin", 
        passport.authenticate('local', {
            failureRedirect: "signin",
            failureFlash: true
        }), userController.signIn
    );
    app.get("/logout", userController.logout)
}