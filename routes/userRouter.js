import express from "express"
import { loggingUser, registerUser } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/", registerUser);

userRouter.post("/logging", loggingUser);

export default userRouter;