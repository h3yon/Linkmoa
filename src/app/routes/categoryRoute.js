module.exports = function (app) {
  const category = require("../controllers/categoryController");
  const jwtMiddleware = require("../../../config/jwtMiddleware");

  app.get("/categories", jwtMiddleware, category.selectCategory);
  app.get(
    "/categories/:categoryIdx/detailcategories/:detailCategoryIdx/folders",
    jwtMiddleware,
    category.selectFoldersByCategory
  );
};
