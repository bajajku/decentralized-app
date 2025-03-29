import { Router } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prismaClient = new PrismaClient();
const JWT_SECRET = "secret";

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
