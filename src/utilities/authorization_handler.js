const jwt = require('jsonwebtoken');

////////////////////////////////////////////////////////////////////////////

module.exports.generate_token = (user) => {
	const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {

		expiresIn: '72h'

   });
	return token;
};