import * as authService from "../services/auth.service.js";
export async function signUp(req, res, next) {
  try {
    res.status(201).json(await authService.signUp(req.body));
  } catch (error) {
    next(error);
  }
}
export async function signIn(req, res, next) {
  try {
    res.json(await authService.signIn(req.body));
  } catch (error) {
    next(error);
  }
}
export async function getCurrentUser(req, res, next) {
  try {
    const user = await authService.currentUser(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    next(error);
  }
}
