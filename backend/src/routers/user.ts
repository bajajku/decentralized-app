import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { JWT_SECRET } from "../index";
import { authMiddleware } from "../middleware";
import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { createTaskInput } from "../types";

const DEFAULT_TITLE = "Please select the correct option";
const router = Router();
const prismaClient = new PrismaClient();

const s3Client = new S3Client({
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.ACCESS_SECRET ?? "",
    },
    region: "us-east-1"
})


router.post("/task", authMiddleware, async (req, res) => {
    // @ts-ignore
    const userId = req.userId;

    const body = req.body;
    const parsedDate = createTaskInput.safeParse(body);

    if (!parsedDate.success) {
        res.status(411).json({ message: "Invalid request" });
        return;
    }

    let response = await prismaClient.$transaction(async (tx) => {
        const task = await tx.task.create({
            data: {
                title: parsedDate.data.title ?? DEFAULT_TITLE,
                amount: 1,
                signature: parsedDate.data.signature,
                user_id: userId
            }
        })

        await tx.option.createMany({
            data: parsedDate.data.options.map((option) => ({
                image_url: option.imageUrl,
                task_id: task.id
            }))
        })

        return task;
    });
    
    res.json({
        id: response.id
    });
})

router.get("/presignedUrl", authMiddleware, async (req, res) => {
    // @ts-ignore
    const userId = req.userId;

    const { url, fields } = await createPresignedPost(s3Client, {
        Bucket: 'data-labelling-s3',
        Key: `data/${userId}/${Math.random()}/image.jpg`,
        Conditions: [
          ['content-length-range', 0, 5 * 1024 * 1024] // 5 MB max
        ],
        Expires: 3600
    })

    res.json({
        preSignedUrl: url,
        fields
    });
})

// signin with wallet
// signing a message
router.post("/signin", async(req, res) => {
  

    const address = "874234j23gh4hj2g3j4hg2jh34";

    const existingUser = await prismaClient.user.findFirst({
        where: {
            address: address
        }
    })

    if (existingUser) {
        const token = jwt.sign({
            userId: existingUser.id
        }, JWT_SECRET)

        res.json({
            token
        })
    } else {
        const user = await prismaClient.user.create({
            data: {
                address: address,
            }
        })

        const token = jwt.sign({
            userId: user.id
        }, JWT_SECRET)

        res.json({
            token
        })
    }
});

export default router;
