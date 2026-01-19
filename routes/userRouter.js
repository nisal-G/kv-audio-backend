import express from "express"
import { blockOrUnblockUser, getAllUsers, getUser, loggingUser, loginWithGoogle, registerUser, sendOTP } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/", registerUser);
userRouter.post("/logging", loggingUser);
userRouter.get("/all", getAllUsers);
userRouter.put("/block/:email", blockOrUnblockUser);
userRouter.get("/get", getUser);
userRouter.post("/googleLogin", loginWithGoogle);
userRouter.post("/sendOTP", sendOTP);

export default userRouter;