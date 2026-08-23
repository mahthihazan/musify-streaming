// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Validation Error
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.details
    });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(403).json({ error: 'Token expired' });
  }

  // Mongoose Errors
  if (err.name === 'MongoError' || err.name === 'MongooseError') {
    return res.status(500).json({ error: 'Database error', message: err.message });
  }

  // Default Error
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler };
