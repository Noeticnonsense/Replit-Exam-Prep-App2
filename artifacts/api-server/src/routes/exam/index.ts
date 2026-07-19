import { Router } from "express";
import infoRouter from "./info";
import studyGuideRouter from "./study-guide";
import mockExamRouter from "./mock-exam";

const router = Router();

router.use(infoRouter);
router.use(studyGuideRouter);
router.use(mockExamRouter);

export default router;
