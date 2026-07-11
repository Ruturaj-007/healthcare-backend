const { verifyAccessToken } = require('../utils/jwt.util');
const ApiError = require('../utils/ApiError');

function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'No token provided'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (error) {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
}

module.exports = protect;