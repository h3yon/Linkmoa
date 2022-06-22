module.exports = function (app) {
  const like = require("../controllers/likeController");
  const jwtMiddleware = require("../../config/jwtMiddleware");

  app.post("/folders/:folderIdx/like", jwtMiddleware, like.addLike);
  app.get("/users/like", jwtMiddleware, like.getLike);
};
