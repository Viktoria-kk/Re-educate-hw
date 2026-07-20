export function errorHandler(error, req, res, next) {
  console.error(error);
  if (error?.code === 11000)
    return res
      .status(409)
      .json({ message: "A user with this email already exists" });
  if (error?.name === "CastError")
    return res.status(400).json({ message: "Invalid ID" });
  res
    .status(error.status || 500)
    .json({ message: error.message || "Internal server error" });
}
