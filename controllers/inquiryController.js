import e from "express";
import Inquiry from "../models/inquiry.js"; 
import { isItCustomer } from "./userController.js"; 

export async function addInquiry(req, res) {

    if(isItCustomer(req)){
        const data = req.body;

        try {
            const newInquiry = new Inquiry({
                id : data.id,
                email : data.email,
                message : data.message,
                phone : data.phone
            });

            await newInquiry.save();
            res.json({message : "Inquiry added successfully"});

        } catch (error) {
            res.status(500).json({error : "Failed to add inquiry"})
        }

    } else {
        res.status(403).json({error : "Access denied"})
    }
}


