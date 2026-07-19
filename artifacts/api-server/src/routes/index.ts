import { Router, type IRouter } from "express";
import healthRouter from "./health";
import examRouter from "./exam";
import wordwatchRouter from "./wordwatch";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/exam", examRouter);
router.use("/wordwatch", wordwatchRouter);

export default router;
