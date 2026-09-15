export function sendSuccess(res, { statusCode = 200, message, data }) {
	return res.status(statusCode).json({
		success: true,
		message,
		data,
	});
}

export function sendError(res, { statusCode = 500, code, message, details }) {
	const response = {
		success: false,
		error: {
			code,
			message,
		},
	};

	if (details) response.error.details = details;

	return res.status(statusCode).json(response);
}
