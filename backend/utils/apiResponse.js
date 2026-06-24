class ApiResponse {
  static success(res, data = null, message = "Success", statusCode = 200) {
    return res.status(statusCode).json({ success: true, message, data });
  }

  static error(res, message = "Internal Server Error", statusCode = 500, errors = null) {
    const payload = { success: false, message };
    if (errors) payload.errors = errors;
    return res.status(statusCode).json(payload);
  }

  static created(res, data, message = "Created successfully") {
    return this.success(res, data, message, 201);
  }
}

module.exports = ApiResponse;
