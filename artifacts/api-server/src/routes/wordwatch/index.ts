import { Router } from "express";
import analyzeRouter from "./analyze";
import humanizeRouter from "./humanize";
import membershipRouter from "./membership";
import checkoutRouter from "./checkout";

const router = Router();

router.use(membershipRouter);
router.use(analyzeRouter);
router.use(humanizeRouter);
router.use(checkoutRouter);

export default router;
