import express from "express";
import { addReview, getReviews, getApprovedReviews, approveOrRejectReview } from "../controllers/reviewController.js";

const reviewRouter = express.Router();

reviewRouter.post("/", addReview);
reviewRouter.get("/get", getReviews);
reviewRouter.get("/approved", getApprovedReviews);  // Public endpoint for approved reviews
reviewRouter.put("/updateStatus/:id", approveOrRejectReview);

export default reviewRouter;