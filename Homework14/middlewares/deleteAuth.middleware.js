export const deleteAuth = (req, res, next) => {
  const secret = req.headers.secret;
  if (!secret || secret !== "random123") {
    return res.status(401).json({
      message: "You need the right secret code to delete an expense!",
    });
  }
  next();
};
