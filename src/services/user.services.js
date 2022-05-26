
const User = require("../database/models/User").Model;
const { generate_password } = require("../utilities/helper");
var bcrypt = require("bcryptjs");
var error_handler = require("../utilities/error_handler");


module.exports.user_signup = async (request_body) => {
    try {
  
      let password = generate_password();
      var salt = bcrypt.genSaltSync(10);
      var hashed_password = bcrypt.hashSync(password, salt);
      const entity = await User.create({
        first_name: request_body.first_name.trim(),
        last_name: request_body.last_name.trim(),
        mobile: request_body.mobile.trim(),
        email: request_body.email.trim(),
        address: request_body.address.trim(),
        password: hashed_password,
      });
      
      const agent_data = get_object_to_send(entity, password);
      return agent_data;
    } catch (error) {
      return error_handler.throw_service_error(
        error,
        "Problem encountered while creating user instance!"
      );
    }
  };

  const get_object_to_send = (entity, password) => {
    if (entity == null) {
      return null;
    }
    return {
      id: entity.id,
      first_name: entity.first_name,
      last_name: entity.last_name,
      mobile: entity.mobile,
      email: entity.email,
      user_name: entity.user_name,
      password: password,
      address: entity.address,
      role_id: entity.role_id,
    };
  };
  