
let response_handler = require("../utilities/response_handler");
let helper = require("../utilities/helper");
let user_service = require("../services/user.services");
var error_handler = require("../utilities/error_handler");

exports.user_signup = async (req, res) => {
  try {
    const is_first_name_empty = helper.is_empty(req.body.first_name.trim());
    const is_last_name_empty = helper.is_empty(req.body.last_name.trim());
    const is_phone_empty = helper.is_empty(req.body.mobile.trim());
    const is_email_empty = helper.is_empty(req.body.email.trim());
    const is_address_empty = helper.is_empty(req.body.address.trim());
  
    if (is_first_name_empty || is_last_name_empty || is_phone_empty || is_email_empty || is_address_empty) {
      response_handler.set_failure_response({
        request: req,
        response: res,
        statusCode: 422,
        message: "Missing required parameters.",
      });
      return;
    }

    const user = await user_service.user_signup(req.body);
    response_handler.set_success_response_and_save_activities({
      request: req,
      response: res,
      data: user,
      statusCode: 201,
      message: "User Onboarded successfully!",
    });
  } catch (error) {
    error_handler.handle_controller_error({
      request: req,
      response: res,
      error: error,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const is_email_empty = helper.is_empty(req.body.email.trim());
    const is_password_empty = helper.is_empty(req.body.password.trim());
  
    if (is_email_empty || is_password_empty) {
      response_handler.set_failure_response({
        request: req,
        response: res,
        statusCode: 422,
        message: "Missing required parameters.",
      });
      return;
    }

    const log_data = await user_service.login(req.body);
    response_handler.set_success_response_and_save_activities({
      request: req,
      response: res,
      data: log_data,
      statusCode: 201,
      message: "Logged in successfully!",
    });
  } catch (error) {
    error_handler.handle_controller_error({
      request: req,
      response: res,
      error: error,
    });
  }
};

exports.update = async (req, res) => {
  try {

    const log_data = await user_service.update(req);
    response_handler.set_success_response_and_save_activities({
      request: req,
      response: res,
      data: log_data,
      statusCode: 201,
      message: "User updated successfully!",
    });
  } catch (error) {
    error_handler.handle_controller_error({
      request: req,
      response: res,
      error: error,
    });
  }
};
