import { getRandomFactService } from "./randomFact.service.js";

export const getRandomFact = async (req, res) => {
  try {
    const fact = await getRandomFactService();
    res.json({ fact });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};
