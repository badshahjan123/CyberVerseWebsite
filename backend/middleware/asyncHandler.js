// Wrapper to handle async errors automatically
// No need to write try-catch in every route
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
