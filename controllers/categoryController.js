const db = require('../models')
const Category = db.Category
let categoryController = {
  getCategories: (req, res) => {
    return Category.findAll({ 
      raw: true,
      nest: true
    }).then(categories => {
      let category = null;
      if(req.params.id){
        category = categories.filter(category => parseInt(req.params.id) === category.id);
      }
      return res.render('admin/categories', { categories, category })
    })
  },
  postCategory: (req, res) => {
    let { name } = req.body; 
    if (!name) {
      req.flash('error_msg', '請輸入名稱')
      return res.redirect('back')
    } else {
      return Category.create({ name }).then(() => { 
        req.flash('success_msg', '類別建立成功')
        return res.redirect('/admin/categories') 
      })
    }
  },
  putCategory: (req, res) => {
    let { name } = req.body;
    if (!name) {
      req.flash('error_msg', '請輸入名稱')
      return res.redirect('back')
    } else {
      return Category.findByPk(req.params.id)
        .then((category) => {
          category.update({ name })
            .then(() => {
              req.flash('success_msg', '類別更新成功')
              res.redirect('/admin/categories')
            })
        })
    }
  },
  deleteCategory: (req, res) => {
    return Category.findByPk(req.params.id)
      .then((category) => {
        category.destroy()
          .then((category) => {
            req.flash('success_msg', '類別刪除成功')
            res.redirect('/admin/categories')
          })
      })
  }
}
module.exports = categoryController