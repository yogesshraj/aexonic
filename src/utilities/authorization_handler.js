const jwt = require('jsonwebtoken');
const response_handler = require('./response_handler');
const logger = require('./logger');

////////////////////////////////////////////////////////////////////////////

module.exports.authenticate = (req, res, next) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (token == null) {
		response_handler.set_failure_response({
			request: req,
			response: res,
			statusCode: 401,
			message: 'Unauthorized access'
		});
	}

	try {
		jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
			if (error) {
				response_handler.set_failure_response({
					request: req,
					response: res,
					statusCode: 403,
					entity_type: entity_type,
					message: 'Forebidden access'
				});
				return false;
			}
			req.user = user;
			next();
		});
	} catch (err) {
		logger.log(JSON.stringify(err));
	}
};

module.exports.generate_token = (user) => {
	const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {

		expiresIn: '72h'

   });
	return token;
};