import e from "express";
import Inquiry from "../models/inquiry.js"; 
import { isItCustomer } from "./userController.js"; 

export async function addInquiry(req, res) {

    try {

        if(isItCustomer(req)) {
            const data = req.body;
            data.email = req.user.email;
            data.phone = req.user.phone;

            // Generate unique ID by finding the last inquiry
            const lastInquiry = await Inquiry.findOne().sort({id: -1});

            // Check if any inquiry exists (null means no inquiries)
            let id;
            if(lastInquiry == null) {
                id = 1;  // First inquiry
            } else {
                id = lastInquiry.id + 1;  // Increment the last id
            }

            data.id = id;

            const newInquiry = new Inquiry(data);
            await newInquiry.save();

            res.status(201).json({message: "Inquiry added successfully"});
        } else {
            res.status(403).json({error: "Only customers can add inquiries"});
        }
 
    } catch (error) {
        res.status(500).json({message: "Failed to add inquiry", error: error.message});
    }   
}


