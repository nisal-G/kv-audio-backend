import Review from "../models/review.js";
import { isItAdmin } from "./userController.js";

export function addReview(req, res) {
    if (req.user == null) {
        res.status(401).json({
            message: "Please logging and try again"
        });
        return;
    }

    const data = req.body;

    data.name = req.user.firstName + " " + req.user.lastName;
    data.profilePicture = req.user.profilePicture;
    data.email = req.user.email;

    const newReview = new Review(data);

    newReview.save().then(() => {
        res.json({ message: "Review added successfully" });
    }).catch((error) => {
        res.status(500).json({ error: "Review addition failed" });
    });
}

export async function getReviews(req, res) {
    if (isItAdmin(req)) {
        try {
            const reviews = await Review.find();
            res.json(reviews);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch reviews. Please try again." });
        }
    } else {
        res.status(403).json({ message: "Access denied. Admins only." });
    }
}

export async function getApprovedReviews(req, res) {
    try {
        // Public endpoint - returns only approved reviews
        const reviews = await Review.find({ isApproved: true });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch reviews. Please try again." });
    }
}

export async function approveOrRejectReview(req, res) {
    const id = req.params.id;
    const isApproved = req.body.isApproved;

    if (isItAdmin(req)) {
        try {
            const review = await Review.findById(id);

            if (review == null) {
                return res.status(404).json({
                    message: "Review not found",
                    error: `Review with ID "${id}" does not exist`
                });
            }

            await Review.updateOne({ _id: id }, { isApproved: isApproved });

            res.json({ message: `Review ${isApproved ? 'approved' : 'rejected'} successfully.` });
        } catch (error) {
            res.status(500).json({ message: "Failed to update review status. Please try again." });
        }
    } else {
        res.status(403).json({ message: "Access denied. Admins only." });
    }
}