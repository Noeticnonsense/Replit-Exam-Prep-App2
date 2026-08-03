import { Router } from "express";
import analyzeRouter from "./analyze";
import humanizeRouter from "./humanize";
import membershipRouter from "./membership";

const router = Router();

router.use(membershipRouter);
router.use(analyzeRouter);
router.use(humanizeRouter);

export default router;
