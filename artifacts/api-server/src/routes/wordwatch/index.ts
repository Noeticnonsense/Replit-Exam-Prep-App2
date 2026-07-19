import { Router } from "express";
import analyzeRouter from "./analyze";
import humanizeRouter from "./humanize";

const router = Router();

router.use(analyzeRouter);
router.use(humanizeRouter);

export default router;
