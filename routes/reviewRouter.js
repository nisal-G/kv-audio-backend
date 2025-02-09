import express from "express";
import { addReview } from "../controllers/reviewController.js";

const reviewRouter = express.Router();

reviewRouter.post("/", addReview);

export default reviewRouter;