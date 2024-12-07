// backend/utils/responseFormat.js

/**
 * Response format function to standardize the API response.
 * @param {object} res - The Express response object.
 * @param {boolean} success - Whether the API request was successful or not.
 * @param {string} message - A message to send in the response.
 * @param {object|array} [data=null] - The data to send in the response (optional).
 * @param {object} [error=null] - Error object in case of failure (optional).
 */
const sendResponse = (res, success, message, data = null, error = null) => {
  const status = success ? 200 : 400; // Default to 200 if success, 400 if error
  const response = {
    success,
    message,
    data,
    error,
  };

  return res.status(status).json(response);
};

module.exports = sendResponse;
