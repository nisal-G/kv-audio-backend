import Review from "../models/review.js";

export function addReview(req,res) {
    if(req.user == null) {
        res.status(401).json({
            message : "Please logging and try again"
        });
        return;
    }

    const data = req.body;

    data.name = req.user.firstName + " " + req.user.lastName;
    data.profilePicture = req.user.profilePicture;
    data.email = req.user.email;

    const newReview = new Review(data);

    newReview.save().then(() => {
        res.json({message : "Review added successfully"});
    }).catch((error) => {
        res.status(500).json({error : "Review addition failed"});
    });
}