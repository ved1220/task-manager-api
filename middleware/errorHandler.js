const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log error for debugging
    const statusCode = err.status || 500;
    res.status(statusCode).json({
      error: {
        message: err.message || 'Internal Server Error',
      },
    });
  };
  
  module.exports = errorHandler;
  