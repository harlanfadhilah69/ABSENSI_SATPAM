// src/utils/response.js
exports.success = (res, data = null, message = "OK") => {
  return res.status(200).json({
    success: true,
    message,
    data,
  });
};

exports.created = (res, data = null, message = "Created") => {
  return res.status(201).json({
    success: true,
    message,
    data,
  });
};

exports.error = (res, status = 400, message = "Error", errors = null) => {
  return res.status(status).json({
    success: false,
    message,
    errors,
  });
};
