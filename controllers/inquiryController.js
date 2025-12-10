import e from "express";
import Inquiry from "../models/inquiry.js"; 
import { isItCustomer, isItAdmin  } from "./userController.js"; 

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


export async function getInquiries(req, res) {

    try {

        if(isItCustomer(req)) {
            const inquiries = await Inquiry.find({email: req.user.email});
            res.status(200).json(inquiries);
            return
        } else if (isItAdmin(req)) {
            const inquiries = await Inquiry.find();
            res.status(200).json(inquiries);
            return
        } else {
            res.status(403).json({error: "You are not authorized to view inquiries"});
            return
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Failed to get inquiries"});
    }
}

export async function deleteInquiry(req, res) {

    try {
        if(isItAdmin(req)) {

            const inquiryId = req.params.id;

            await Inquiry.deleteOne({id: inquiryId});

            res.status(200).json({message: "Inquiry deleted successfully"});
            return
        } else if (isItCustomer(req)) {

            const inquiryId = req.params.id;
            const inquiry = await Inquiry.findOne({id: inquiryId});

            if(inquiry == null) {
                res.status(404).json({error: "Inquiry not found"});
                return
            } else {

                if (inquiry.email == req.user.email) {
                    await Inquiry.deleteOne({id: inquiryId});
                    res.status(200).json({message: "Inquiry deleted successfully"});
                    return
                } else {
                    res.status(403).json({error: "You are not authorized to delete this inquiry"});
                    return
                }
            }
        } else {
            res.status(403).json({error: "You are not authorized to delete inquiries"});
            return
        }


    } catch (error) {
        res.status(500).json({message: "Failed to delete inquiry"});
    }
}


export async function updateInquiry(req, res) {

    try {
        if(isItCustomer(req)) {

            const inquiryId = req.params.id;
            const data = req.body;

            const inquiry = await Inquiry.findOne({id: inquiryId});

            if(inquiry == null) {
                res.status(404).json({error: "Inquiry not found"});
                return
            } else { 
                if(inquiry.email == req.user.email) {
                    await Inquiry.updateOne({id: inquiryId},{message: data.message});
                    res.status(200).json({message: "Inquiry updated successfully"});
                    return
                } else {
                    res.status(403).json({error: "You are not authorized to update this inquiry"});
                    return
                }
            }
        } else {
            res.status(403).json({error: "Only customers can update inquiries"});
            return
        }
    } catch (error) {
        res.status(500).json({message: "Failed to update inquiry"});
    }
}