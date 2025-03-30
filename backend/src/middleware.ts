import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET, WORKER_JWT_SECRET } from "./config";


export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization;
    if (!token) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // @ts-ignore
        if(decoded.userId){
            // @ts-ignore
            req.userId = decoded.userId;
            next();
        } else {
            res.status(403).json({ message: "Unauthorized" });
        }
    } catch (error) {
        res.status(403).json({ message: "Unauthorized" });
    }
}


export function workerMiddleware(req: Request, res: Response, next: NextFunction): void { 
    const authHeader = req.headers["authorization"] ?? "";

    console.log(authHeader);
    try {
        const decoded = jwt.verify(authHeader, WORKER_JWT_SECRET);
        // @ts-ignore
        if (decoded.userId) {
            // @ts-ignore
            req.userId = decoded.userId;
            next();
        } else {
            res.status(403).json({
                message: "You are not logged in"
            });    
        }
    } catch(e) {
        res.status(403).json({
            message: "You are not logged in"
        });
    }
}