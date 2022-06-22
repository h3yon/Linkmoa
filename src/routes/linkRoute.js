module.exports = function (app) {
  const jwtMiddleware = require("../../../config/jwtMiddleware");
  const link = require("../controllers/linkController");

  app.post("/folders/:folderIdx/link", jwtMiddleware, link.addLink);
  app.patch("/links/:linkIdx", jwtMiddleware, link.changeLink);
  app.patch("/links/:linkIdx/status", jwtMiddleware, link.deleteLink);
  app.get("/links/search", jwtMiddleware, link.searchLink);
};
