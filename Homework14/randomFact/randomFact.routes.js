import { Router } from "express";
import { randomBlock } from "./randomBlock.middleware.js";
import { getRandomFact } from "./randomFact.controller.js";

const router = Router();

router.get("/", randomBlock, getRandomFact);
export default router;
