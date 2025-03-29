import express from "express";
import workerRouter from "./routers/worker";
import userRouter from "./routers/user";

const app = express();

app.use(express.json());

export const JWT_SECRET = "secret";

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});     

app.use("/worker", workerRouter);
app.use("/user", userRouter);
