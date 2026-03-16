import { Router, type IRouter } from "express";
import healthRouter from "./health";
import directoryRouter from "./v1/directory";
import creditorsRouter from "./v1/creditors";
import ingestRouter from "./v1/ingest";
import reviewQueueRouter from "./v1/reviewQueue";
import activityRouter from "./v1/activity";

const router: IRouter = Router();

router.use(healthRouter);

const v1 = Router();
v1.use("/directory", directoryRouter);
v1.use("/creditors", creditorsRouter);
v1.use("/ingest", ingestRouter);
v1.use("/review-queue", reviewQueueRouter);
v1.use("/activity", activityRouter);

router.use("/v1", v1);

export default router;
