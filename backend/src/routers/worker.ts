import { PrismaClient } from "@prisma/client";
import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { workerMiddleware } from "../middleware";
import { JWT_SECRET, WORKER_JWT_SECRET } from "../config";
import { getNextTask } from "../db";
import { createSubmissionInput } from "../types";
import { parse } from "path";


const TOTAL_SUBMISSIONS = 100;

const prismaClient = new PrismaClient();

prismaClient.$transaction(
    async (prisma) => {
      // Code running in a transaction...
    },
    {
      maxWait: 5000, // default: 2000
      timeout: 10000, // default: 5000
    }
)

const router = Router();

router.post("/submission", workerMiddleware, async (req: Request, res: Response) => {
    // @ts-ignore
    const userId: string = req.userId;

    const body = req.body;
    const parsedBody = createSubmissionInput.safeParse(body);

    if (!parsedBody.success) {
        res.status(411).json({
            message: "Invalid request"
        });
    }

    const task = await getNextTask(Number(userId));

    if (!task || task?.Id !== parsedBody.data.taskId) {
        res.status(411).json({
            message: "Invalid task"
        });             
    }

    const submission = await prismaClient.submission.create({

});


router.get("/nextTask", workerMiddleware, async (req: Request, res: Response) => {
    // @ts-ignore
    const userId: string = req.userId;

    const task = await getNextTask(Number(userId));

    if (!task) {
        res.status(411).json({   
            message: "No more tasks left for you to review"
        });
    } else {
        res.json({   
            task
        });
    }
});

router.post("/signin", async(req, res) => {

  const address = "werwrwerewrwerwe";

  const existingWorker = await prismaClient.worker.findFirst({
      where: {
          address: address
      }
  })

  if (existingWorker) {
      const token = jwt.sign({
          userId: existingWorker.id
      }, WORKER_JWT_SECRET)

      res.json({
          token
      })
  } else {
      const worker = await prismaClient.worker.create({
          data: {
              address: address,
              pending_amount: 0,
              locked_amount: 0
          }
      })

      const token = jwt.sign({
          workerId: worker.id
      }, WORKER_JWT_SECRET)

      res.json({
          token
      })
  }
});



export default router;