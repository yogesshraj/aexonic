require("dotenv").config();

const express = require("express");
const db = require("./database/connection");
const logger = require("./utilities/logger");

const app = express();


async function setup_db() {
    try {
      await db.create_db_if_does_not_exist();
      await db.migrate_database();
      await db.sequelize.authenticate();
      logger.log("Database connection has been established successfully.");
    } catch (error) {
      logger.log_error(`Unable to connect to the database:${error.message}`);
    }
}

exports.set_middlewares = () => {
    return new Promise((resolve, reject) => {
        try {
        const bodyParser = require("body-parser");
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(express.json());

        resolve(true);
        } catch (error) {
        reject(error);
        }
    });
};

module.exports.set_routes = () => {
    return new Promise((resolve, reject) => {
        try {
        // require("./routes/login.routes")(app);
        // require("./routes/agent.routes")(app);
        //Set the base route
        app.get("/api/v1/", (req, res) => {
            res.send({ message: "API [Service version - 0.1]" });
        });
        resolve(true);
        } catch (error) {
        reject(error);
        }
    });
};


module.exports.start_listening = () => {
    return new Promise((resolve, reject) => {
      try {
        const port = process.env.PORT;
        var server = app.listen(port, () => {
          var serviceName = `api-${process.env.NODE_ENV}`;
          logger.log(
            `${serviceName} is up and listening on port ${process.env.PORT.toString()}`
          );
          app.emit("server_started");
        });
        module.exports.server = server;
        resolve(app);
      } catch (error) {
        reject(error);
      }
    });
};

module.exports.fireup_server = async () => {
    var app = await this.start_listening();
    return app;
};

  
function start_server() {
    (async () => {
        await setup_db();
        await exports.set_middlewares();
        await exports.set_routes();
        await exports.fireup_server();
    })();
}
  
if (process.env.NODE_ENV !== "test") {
    start_server();
}
  
  module.exports.app = app;