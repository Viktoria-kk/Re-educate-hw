import jwt from "jsonwebtoken";

export function isAuth(req, res, next) {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;
  if (!token)
    return res.status(401).json({ message: "Authentication required" });
  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).userId;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired access token" });
  }
}
