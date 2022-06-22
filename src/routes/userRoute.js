module.exports = function (app) {
  const user = require("../controllers/userController");
  const jwtMiddleware = require("../../config/jwtMiddleware");

  app.post("/apple-login", user.appleLogin);
  app.patch("/users/:userIdx/status", jwtMiddleware, user.deleteUserInfo);
  app.get("/users", jwtMiddleware, user.getUserInfo);
  // app.get("/userNickname-check/:userNickname", jwtMiddleware, user.nicknameCheck);
};
