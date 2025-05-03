const { logAction } = require("./logger");

function sendResponse(req, res, statusCode, action, messageObj, logDetails = {}) {
  logAction(req, action, logDetails);
  return res.status(statusCode).json(messageObj);
}

module.exports = { sendResponse };
