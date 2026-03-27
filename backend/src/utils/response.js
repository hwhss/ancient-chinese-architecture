function sendSuccess(res, data, status = 200, msg = 'success') {
  return res.status(status).json({
    code: status,
    msg,
    data
  });
}

function sendError(res, status, msg, detail) {
  const body = {
    code: status,
    msg
  };

  if (detail) {
    body.error = detail;
  }

  return res.status(status).json(body);
}

module.exports = {
  sendSuccess,
  sendError
};
