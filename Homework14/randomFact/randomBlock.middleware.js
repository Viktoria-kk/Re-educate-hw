export const randomBlock = (req, res, next) => {
  if (Math.random() < 0.5) {
    return res.status(403).json({
      message: "Request blocked randomly",
    });
  }
  next();
};
