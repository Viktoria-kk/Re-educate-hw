import { getLeaderboard } from "../services/leaderboard.service.js";
export async function leaderboard(req, res, next) {
  try {
    res.json(await getLeaderboard());
  } catch (error) {
    next(error);
  }
}
