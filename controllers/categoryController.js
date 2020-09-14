const db = require('../models')
const Category = db.Category
let categoryController = {
  getCategories: (req, res) => {
    return Category.findAll({ 
      raw: true,
      nest: true
    }).then(categories => {
      return res.render('admin/categories', { categories })
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
}
module.exports = categoryController