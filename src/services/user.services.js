
const User = require("../database/models/User").Model;
const { generate_password, is_empty } = require("../utilities/helper");
var bcrypt = require("bcryptjs");
var error_handler = require("../utilities/error_handler");
const authorization_handler = require('../utilities/authorization_handler');
const validator = require("email-validator");
const Op = require('sequelize').Op;


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

      let access_token = authorization_handler.generate_token({
        user_id: entity.id,
        user_name: entity.user_name,
        first_name: entity.first_name,
        last_name: entity.last_name,
        mobile: entity.mobile,
        email: entity.email,
      });
      await User.update({token : access_token},
        {
          where: {
            id : entity.id
          }
        }
      ) 
      
      const agent_data = get_object_to_send(entity, password, access_token);
      return agent_data;
    } catch (error) {
      return error_handler.throw_service_error(
        error,
        "Problem encountered while creating user instance!"
      );
    }
  };

const validation_email_signup_checkup = async (request_header, request_body, is_update) => {
  try {
    if (!is_empty(request_header.email.trim())) {
      var email_validation = validator.validate(request_header.email.trim());
      if (!email_validation) {
        throw new Error("This email address is not valid!");
      }
      if(is_update) {
        const user_checkup = await User.count({
          where: { 
            email: request_body.email? request_body.email.trim() : request_header.email.trim(), 
            is_active: true,
            [Op.not] : [{id : request_header.user_id}]
         },
        });

        if (user_checkup) {
          {
          throw new Error("User with this email already exists!");
          }
        }
      } 
      else {
        const user_checkup = await User.count({
          where: { email: request_header.email.trim(), is_active: true },
        });

        if (user_checkup) {
          {
          throw new Error("User with this email already exists!");
          }
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

const get_object_to_send = (entity, password, access_token) => {
  if (entity == null) {
    return null;
  }
  return {
    id: entity.id,
    first_name: entity.first_name,
    last_name: entity.last_name,
    mobile: entity.mobile,
    email: entity.email,
    password: password,
    address: entity.address,
    token: access_token,
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

    return "Logged in successfully!";
  } catch (error) {
    return error_handler.throw_service_error(
      error,
      "Problem encountered while login!"
    );
  }
};

module.exports.update = async (request) => {
  try {
    const user = await User.findOne({
      where: { email: request.user.email.trim(), is_active: true },
    });
    if(!user){
      throw new Error("User not found!");
    }

    await validation_email_signup_checkup(request.user, request.body, true);

    var updates = get_updates(user, request.body);
    let is_updated = await User.update(updates,
      {
        where : {
          id: request.user.user_id,
          is_active: true,
        }
      }
    );

    if(is_updated[0]) {
      const updated_user = await User.findOne({
        where: { id: request.user.user_id, is_active: true },
      });
      return updated_user;
    } else {
      throw Error("Not updated properly!")
    }

  } catch (error) {
    return error_handler.throw_service_error(
      error,
      "Problem encountered while updating user!"
    );
  }
};

module.exports.get_all = async (filter) => {
  try {

    let objects = [];
		let current_page = 0;
		let total_pages = 0;

		var search = { where: { is_active: true } };
    if (filter.hasOwnProperty('contact_name')) {
			search.where = {
				[Op.or]: [
					{ first_name: { [Op.iLike]: '%' + filter.contact_name + '%' } },
					{ last_name: { [Op.iLike]: '%' + filter.contact_name + '%' } },
				],
			};
		}
		if (filter.hasOwnProperty('mobile')) {
			search.where['mobile'] = { [Op.iLike]: '%' + filter.mobile + '%' };
		}
		if (filter.hasOwnProperty('email')) {
			search.where['email'] = { [Op.iLike]: '%' + filter.email + '%' };
		}
    const users = await User.findAll(search);

    ({ current_page, total_pages, objects } = paginate_users(filter, users));
   
    return { current_page, total_pages, objects };
  } catch (error) {
    return error_handler.throw_service_error(
      error,
      "Problem encountered while getting all users!"
    );
  }
};

const get_updates = (user, request_user) => {
  let access_token = authorization_handler.generate_token({
    user_id: user.id,
    user_name: user.user_name,
    first_name: request_user.first_name ? request_user.first_name: user.first_name,
    last_name: request_user.last_name ? request_user.last_name: user.last_name,
    mobile: request_user.mobile ? request_user.mobile: user.mobile,
    email: request_user.email ? request_user.email: user.email,
  });
  const updates = {
    first_name: request_user.first_name ? request_user.first_name: user.first_name,
    last_name: request_user.last_name ? request_user.last_name: user.last_name,
    email: request_user.email ? request_user.email: user.email,
    mobile: request_user.mobile ? request_user.mobile: user.mobile,
    address: request_user.address ? request_user.address: user.address,
    token: access_token,
  }

  return updates;
}

function paginate_users(filter, objects) {
	if (filter.hasOwnProperty('page') && filter.hasOwnProperty('items_per_page')) {
		var start_offset = (filter.page - 1) * filter.items_per_page;
		var end_offset = filter.page * filter.items_per_page;
		var current_page = filter.page ? +filter.page : 1;
		var total_pages = Math.ceil(objects.length / parseInt(filter.items_per_page));
		objects = objects.slice(start_offset, end_offset);
	}
	return { current_page, total_pages, objects };
}
