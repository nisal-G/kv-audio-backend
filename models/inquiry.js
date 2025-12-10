import { response } from "express";
import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema({

    id : {
        type: Number,
        required: true,
        unique: true
    },
    
    email : {
        type: String,
        required: true,
        unique: true
    },

    message : {
        type: String,
        required: true
    },

    createdAt : {
        type: Date,
        default: Date.now
    },

    phone : {
        type: String,
        required: false
    },

    response : {
        type: String,
        required: false,
        default: " "
    },

    isResolved : {
        type: Boolean,
        required: true,
        default: false
    }
})

const Inquiry = mongoose.model("Inquiry", inquirySchema);

export default Inquiry;
