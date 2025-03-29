import { Router } from "express";

const router = Router();

// signin with wallet
// signing a message
router.post("/signin", (req, res) => {
  const { signature } = req.body;
  const { address } = req.body;
  const { message } = req.body;
});

export default router;
