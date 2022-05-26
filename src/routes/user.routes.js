const controller = require("../controllers/user.controller");

module.exports = (app) => {
  const router = require("express").Router();

  router.post("/user-signup", controller.user_signup);
  router.post('/login', controller.login);
  

  app.use("/api/v1/", router);
};
