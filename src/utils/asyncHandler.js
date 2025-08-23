const asyncHandler = (requestHandler) => {
  //wrapper fn which used several times in code
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };
