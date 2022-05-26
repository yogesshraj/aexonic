const controller = require("../controllers/user.controller");
const authenticate = require("../utilities/authorization_handler").authenticate;

module.exports = (app) => {
  const router = require("express").Router();

  router.post("/user-signup", controller.user_signup);
  router.post('/login', controller.login);
  router.put('/update', authenticate, controller.update);
  

  app.use("/api/v1/", router);
};
