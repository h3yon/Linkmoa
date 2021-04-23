module.exports = function (app) {
  const folder = require("../controllers/folderController");
  const jwtMiddleware = require("../../../config/jwtMiddleware");

  app.get("/users/folders", jwtMiddleware, folder.selectMyFolder);
  app.get("/users/:userIdx/folders", jwtMiddleware, folder.selectUserFolder);

  app.get("/folders/search", jwtMiddleware, folder.searchFolder);
  app.get("/folders/top", jwtMiddleware, folder.getTopFolder);
  app.get("/folders/today", jwtMiddleware, folder.todayFolder);

  app.get("/folders/:folderIdx", jwtMiddleware, folder.selectFolderDetail);
  app.post("/folders", jwtMiddleware, folder.insertFolder);
  app.patch("/folders/:folderIdx", jwtMiddleware, folder.updateFolder);
  app.patch("/folders/:folderIdx/status", jwtMiddleware, folder.deleteFolder);
};
