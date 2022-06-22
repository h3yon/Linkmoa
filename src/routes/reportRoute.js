module.exports = function (app) {
  const report = require("../controllers/reportController");
  const jwtMiddleware = require("../../config/jwtMiddleware");

  app.post("/reports", jwtMiddleware, report.addReport);

  // 관리자용 API
  app.get("/reports/folders", report.selectReport);
};
