const response_handler = require('./response_handler');
const ServiceError = require('./service_error').ServiceError;

////////////////////////////////////////////////////////////////////////////////

module.exports.handle_controller_error = ({ request, response, error }) => {
	let message = '';
	let errorCode = response.statusCode === 200 ? 500 : response.statusCode;
	let trace = error.stack;
	let error_details = null;

	if (error.hasOwnProperty('message')) {
		message = error.message;
	}

	if (trace == null || trace === 'undefined') {
		if (error.hasOwnProperty('data')) {
			const data = error.data;
			if (data != null) {
				trace = error.data.trace;
				if (data.hasOwnProperty('errorCode')) {
					errorCode = error.data.errorCode;
				}
			}
			if (error.hasOwnProperty('Stringify')) {
				trace = error.Stringify();
			}
		}
	}

	if (error.hasOwnProperty('data')) {
		const data = error.data;
		if (data != null) {
			if (data.hasOwnProperty('details')) {
				error_details = error.data.details;
			}
		}
	}
	if (error_details == null) {
		error_details = message;
	}

	return response_handler.set_failure_response({
		request: request,
		response: response,
		statusCode: errorCode,
		message,
		trace,
		error_details,
	});
};

module.exports.throw_service_error = (error, msg) => {
	if (error instanceof ServiceError) {
		throw error;
	} else {
		throw new ServiceError(msg, 200, error.message);
	}
};
