const express = require("express");
const compression = require("compression");
const methodOverride = require("method-override");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({
  path: path.resolve(process.cwd(), process.env.NODE_ENV == "production" ? ".env" : ".env.dev"),
});

/* 이 부분 추가해봄 */
// var passport = require('passport');
// var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

module.exports = function () {
  const app = express();

  app.use(compression());

  app.use(express.json());

  app.use(express.urlencoded({ extended: true }));

  app.use(methodOverride());

  app.use(cors());
  // app.use(express.static(process.cwd() + '/public'));
  /* passport 추가해봄 */

  /* App (Android, iOS) */
  require("../src/app/routes/indexRoute")(app);
  require("../src/app/routes/userRoute")(app);
  require("../src/app/routes/googleRoute")(app);
  require("../src/app/routes/folderRoute")(app);
  require("../src/app/routes/likeRoute")(app);
  require("../src/app/routes/linkRoute")(app);
  require("../src/app/routes/reportRoute")(app);
  require("../src/app/routes/categoryRoute")(app);

  /* Web */
  // require('../src/web/routes/indexRoute')(app);

  /* Web Admin*/
  // require('../src/web-admin/routes/indexRoute')(app);
  return app;
};
