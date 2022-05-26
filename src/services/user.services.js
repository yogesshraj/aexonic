
const User = require("../database/models/User").Model;
const { generate_password, is_empty } = require("../utilities/helper");
var bcrypt = require("bcryptjs");
var error_handler = require("../utilities/error_handler");
const authorization_handler = require('../utilities/authorization_handler');
const validator = require("email-validator");


module.exports.user_signup = async (request_body) => {
    try {

      await validation_email_signup_checkup(request_body);
  
      let password = generate_password();
      const entity = await User.create({
        first_name: request_body.first_name.trim(),
        last_name: request_body.last_name.trim(),
        mobile: request_body.mobile.trim(),
        email: request_body.email.trim(),
        address: request_body.address.trim(),
        password: password,
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

const validation_email_signup_checkup = async (request_body) => {
  try {
    if (!is_empty(request_body.email.trim())) {
      var email_validation = validator.validate(request_body.email.trim());
      if (!email_validation) {
        throw new Error("This email address is not valid!");
      }
      const user_checkup = await User.count({
        where: { email: request_body.email.trim(), is_active: true },
      });
      if (user_checkup) {
        {
        throw new Error("User with this email already exists!");
        }
      }
    }
  } catch (error) {
    return error_handler.throw_service_error(
      error,
      "Problem encountered while validating email signup checkup!"
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


module.exports.login = async (request_body) => {
  try {
    const user = await User.findOne({
      where: { email: request_body.email.trim(), is_active: true },
    });
    if(!user){
      throw new Error("User not found!");
    }

    const is_password_valid = bcrypt.compareSync(request_body.password, user.password);
		if (!is_password_valid) {
			throw new Error('Incorrect password!');
		}

    let access_token = authorization_handler.generate_token({
      user_id: user.id,
      user_name: user.user_name,
      first_name: user.first_name,
      last_name: user.last_name,
      mobile: user.mobile,
      email: user.email,
    });

    return access_token;
  } catch (error) {
    return error_handler.throw_service_error(
      error,
      "Problem encountered while login!"
    );
  }
};