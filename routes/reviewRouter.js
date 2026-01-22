import express from "express";
import { addReview, getReviews, approveOrRejectReview } from "../controllers/reviewController.js";

const reviewRouter = express.Router();

reviewRouter.post("/", addReview);
reviewRouter.get("/get", getReviews);
reviewRouter.put("/updateStatus/:id", approveOrRejectReview);

export default reviewRouter;