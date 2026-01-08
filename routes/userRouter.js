import express from "express"
import { blockOrUnblockUser, getAllUsers, loggingUser, registerUser } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/", registerUser);
userRouter.post("/logging", loggingUser);
userRouter.get("/all", getAllUsers);
userRouter.put("/block/:email", blockOrUnblockUser);

export default userRouter;