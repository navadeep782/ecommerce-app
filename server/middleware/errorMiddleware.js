const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
  };
  
  const errorHandler = (err, req, res, next) => {
    if (err.code === 11000) {
  return res.status(400).json({
    message: "Email already registered"
  });
}
    res.status(res.statusCode || 500).json({
      message: err.message,
    });
  };
  
  module.exports = { notFound, errorHandler };