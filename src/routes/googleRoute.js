module.exports = function (app) {
  const google = require("../controllers/googleController");
  const jwtMiddleware = require("../../config/jwtMiddleware");

  //라우터 연결
  const router = require("express").Router();
  const googlePassport = require("../../config/google-passport");

  //구글 로그인
  app.get(
    "/google",
    googlePassport.authenticate("google", {
      session: false,
      scope: ["profile", "email"],
    })
  );
  app.get(
    "/google-callback",
    googlePassport.authenticate("google", { session: false }),
    googleSuccess
  );

  async function googleSuccess(req, res) {
    try {
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "구글 토큰 받아오기 성공",
        googleId: req.user.googleId,
        accessToken: req.user.accessToken,
      });
    } catch (error) {
      return res.json({
        isSuccess: false,
        code: 2000,
        message: "구글 토큰 받아오기 실패",
        error,
      });
    }
  }

  app.post("/google-login", google.googleLogin);
  app.patch("/users", jwtMiddleware, google.addUserInfo);
};
